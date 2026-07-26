"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  completeLiveTask,
  createLiveCareSpace,
  createLiveReminder,
  createLiveTask,
  loadLiveCareBootstrap,
} from "@/data/live";
import type {
  Appointment,
  CarePerson,
  CareTask,
  Medication,
  Reminder,
} from "@/data/types";

export type SetupKind = "task" | "reminder" | "medicine" | "appointment";

interface CareContextValue {
  careSpaceId: string | null;
  careSpaceName: string | null;
  tasks: CareTask[];
  reminders: Reminder[];
  medications: Medication[];
  appointments: Appointment[];
  people: CarePerson[];
  isLiveLoading: boolean;

  addTask: (task: CareTask) => void;
  addReminder: (reminder: Reminder) => void;
  addMedication: (medication: Medication) => void;
  addAppointment: (appointment: Appointment) => void;
  setTaskStatus: (id: string, status: CareTask["status"]) => void;
  crossOutTask: (id: string) => void;
  convertTaskToReminder: (id: string) => void;
  createCareSpace: (name: string, description?: string | null) => Promise<void>;

  /** Which quick-setup form is open, or null when the sheet is closed. */
  setupKind: SetupKind | null;
  openSetup: (kind: SetupKind) => void;
  closeSetup: () => void;

  /** Transient confirmation copy shown after something is created. */
  toast: string | null;
  clearToast: () => void;
}

const CareContext = createContext<CareContextValue | null>(null);

/**
 * Holds the care plan for the whole caregiver app.
 *
 * The provider hydrates live tasks/reminders from the backend on mount, then
 * writes new tasks/reminders back through the API. Data that the backend does
 * not support as direct user-created records yet (medicines and appointments)
 * stays local-only until those endpoints exist.
 */
export function CareProvider({
  initialTasks,
  initialReminders,
  initialMedications,
  initialAppointments,
  people,
  children,
}: {
  initialTasks: CareTask[];
  initialReminders: Reminder[];
  initialMedications: Medication[];
  initialAppointments: Appointment[];
  people: CarePerson[];
  children: ReactNode;
}) {
  const [careSpaceId, setCareSpaceId] = useState<string | null>(null);
  const [careSpaceName, setCareSpaceName] = useState<string | null>(null);
  const [carePeople, setCarePeople] = useState(people);
  const [isLiveLoading, setIsLiveLoading] = useState(true);
  const [tasks, setTasks] = useState(initialTasks);
  const [reminders, setReminders] = useState(initialReminders);
  const [medications, setMedications] = useState(initialMedications);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [setupKind, setSetupKind] = useState<SetupKind | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    loadLiveCareBootstrap()
      .then((seed) => {
        if (!active) return;
        if (seed === null) {
          setIsLiveLoading(false);
          return;
        }
        setCareSpaceId(seed.careSpaceId);
        setCareSpaceName(seed.careSpaceName);
        setCarePeople([seed.currentUser]);
        setTasks(seed.tasks);
        setReminders(seed.reminders);
        setToast(`Loaded ${seed.careSpaceName} from Supabase`);
        setIsLiveLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setIsLiveLoading(false);
        setToast("Live care data is unavailable right now");
      });

    return () => {
      active = false;
    };
  }, []);

  const createCareSpace = useCallback(async (name: string, description: string | null = null) => {
    setIsLiveLoading(true);
    try {
      await createLiveCareSpace(name, description);
      const seed = await loadLiveCareBootstrap();
      if (seed === null) {
        throw new Error("The care space was created but could not be loaded.");
      }

      setCareSpaceId(seed.careSpaceId);
      setCareSpaceName(seed.careSpaceName);
      setCarePeople([seed.currentUser]);
      setTasks(seed.tasks);
      setReminders(seed.reminders);
      setToast(`Created ${seed.careSpaceName} and connected it to Supabase`);
    } finally {
      setIsLiveLoading(false);
    }
  }, []);

  const addTask = useCallback(
    (task: CareTask) => {
      if (careSpaceId === null) {
        setToast("Create a care space before adding tasks");
        return;
      }

      createLiveTask(careSpaceId, task)
        .then((saved) => {
          setTasks((current) => [saved, ...current]);
          setToast("Task saved to Supabase");
        })
        .catch(() => {
          setToast("Could not save task to Supabase");
        });
    },
    [careSpaceId],
  );

  const addReminder = useCallback(
    (reminder: Reminder) => {
      if (careSpaceId === null) {
        setToast("Create a care space before adding reminders");
        return;
      }

      createLiveReminder(careSpaceId, reminder)
        .then((saved) => {
          setReminders((current) => [saved, ...current]);
          setToast(`Reminder saved for ${saved.timeLabel}`);
        })
        .catch(() => {
          setToast("Could not save reminder to Supabase");
        });
    },
    [careSpaceId],
  );

  const addMedication = useCallback((medication: Medication) => {
    setMedications((current) => [medication, ...current]);
    setToast(`${medication.name} added locally`);
  }, []);

  const addAppointment = useCallback((appointment: Appointment) => {
    setAppointments((current) => [appointment, ...current]);
    setToast(`${appointment.title} added locally`);
  }, []);

  const setTaskStatus = useCallback((id: string, status: CareTask["status"]) => {
    if (status === "done") {
      completeLiveTask(id)
        .then((saved) => {
          setTasks((current) => current.map((task) => (task.id === id ? saved : task)));
          setToast("Task completion saved to Supabase");
        })
        .catch(() => {
          setToast("Could not save task completion");
        });
    }

    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, status, completedAt: status === "done" ? "Just now" : null }
          : task,
      ),
    );
  }, []);

  const crossOutTask = useCallback(
    (id: string) => {
      setTaskStatus(id, "done");
    },
    [setTaskStatus],
  );

  const convertTaskToReminder = useCallback(
    (id: string) => {
      if (careSpaceId === null) {
        setToast("Create a care space before adding reminders");
        return;
      }

      const task = tasks.find((candidate) => candidate.id === id);
      if (task === undefined) return;

      const timeLabel = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).replace(" ", "");
      const reminder: Reminder = {
        id: `reminder-from-${task.id}`,
        title: task.title,
        kind: "custom",
        timeLabel,
        repeatLabel: "Once",
        enabled: true,
        lastConfirmed: null,
      };

      createLiveReminder(careSpaceId, reminder)
        .then((saved) => {
          setReminders((current) => [saved, ...current]);
          setToast("Task converted to a reminder in Supabase");
        })
        .catch(() => {
          setToast("Could not create the reminder in Supabase");
        });
    },
    [careSpaceId, tasks],
  );

  const value = useMemo<CareContextValue>(
    () => ({
      careSpaceId,
      careSpaceName,
      tasks,
      reminders,
      medications,
      appointments,
      people: carePeople,
      isLiveLoading,
      addTask,
      addReminder,
      addMedication,
      addAppointment,
      setTaskStatus,
      crossOutTask,
      convertTaskToReminder,
      createCareSpace,
      setupKind,
      openSetup: setSetupKind,
      closeSetup: () => setSetupKind(null),
      toast,
      clearToast: () => setToast(null),
    }),
    [
      careSpaceId,
      careSpaceName,
      tasks,
      reminders,
      medications,
      appointments,
      carePeople,
      isLiveLoading,
      addTask,
      addReminder,
      addMedication,
      addAppointment,
      setTaskStatus,
      crossOutTask,
      convertTaskToReminder,
      createCareSpace,
      setupKind,
      toast,
    ],
  );

  return <CareContext.Provider value={value}>{children}</CareContext.Provider>;
}

export function useCare(): CareContextValue {
  const context = useContext(CareContext);
  if (context === null) {
    throw new Error("useCare must be used inside a CareProvider");
  }
  return context;
}

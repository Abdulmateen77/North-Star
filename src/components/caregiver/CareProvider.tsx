"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  Appointment,
  CarePerson,
  CareTask,
  Medication,
  Reminder,
} from "@/data/types";

export type SetupKind = "task" | "reminder" | "medicine" | "appointment";

interface CareContextValue {
  tasks: CareTask[];
  reminders: Reminder[];
  medications: Medication[];
  appointments: Appointment[];
  people: CarePerson[];

  addTask: (task: CareTask) => void;
  addReminder: (reminder: Reminder) => void;
  addMedication: (medication: Medication) => void;
  addAppointment: (appointment: Appointment) => void;
  setTaskStatus: (id: string, status: CareTask["status"]) => void;

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
 * Everything the caregiver sets up — a task, a reminder, a medicine, an
 * appointment — lands here, so adding from the dashboard immediately shows up
 * on the care plan without a round trip. When the backend grows these
 * endpoints, each `add*` becomes an optimistic update wrapped around a POST.
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
  const [tasks, setTasks] = useState(initialTasks);
  const [reminders, setReminders] = useState(initialReminders);
  const [medications, setMedications] = useState(initialMedications);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [setupKind, setSetupKind] = useState<SetupKind | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const addTask = useCallback((task: CareTask) => {
    setTasks((current) => [task, ...current]);
    setToast(`Task added for ${task.dueLabel.toLowerCase()}`);
  }, []);

  const addReminder = useCallback((reminder: Reminder) => {
    setReminders((current) => [reminder, ...current]);
    setToast(`Margaret will be reminded at ${reminder.timeLabel}`);
  }, []);

  const addMedication = useCallback((medication: Medication) => {
    setMedications((current) => [medication, ...current]);
    setToast(`${medication.name} added to Margaret's medicines`);
  }, []);

  const addAppointment = useCallback((appointment: Appointment) => {
    setAppointments((current) => [appointment, ...current]);
    setToast(`${appointment.title} added on ${appointment.dateLabel}`);
  }, []);

  const setTaskStatus = useCallback((id: string, status: CareTask["status"]) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, status, completedAt: status === "done" ? "Just now" : null }
          : task,
      ),
    );
  }, []);

  const value = useMemo<CareContextValue>(
    () => ({
      tasks,
      reminders,
      medications,
      appointments,
      people,
      addTask,
      addReminder,
      addMedication,
      addAppointment,
      setTaskStatus,
      setupKind,
      openSetup: setSetupKind,
      closeSetup: () => setSetupKind(null),
      toast,
      clearToast: () => setToast(null),
    }),
    [
      tasks,
      reminders,
      medications,
      appointments,
      people,
      addTask,
      addReminder,
      addMedication,
      addAppointment,
      setTaskStatus,
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

import AdmitPatientPage from "./src/pages/AdmitPatientPage";
import TransferPatientPage from "./src/pages/TransferPatientPage";
import DischargePatientPage from "./src/pages/DischargePatientPage";
import TreatmentPage from "./src/pages/TreatmentPage";
import PatientsByWardPage from "./src/pages/PatientsByWardPage";
import PatientsByTeamPage from "./src/pages/PatientsByTeamPage";
import PatientDetailsPage from "./src/pages/PatientDetailsPage";
import ManageWardsPage from "./src/pages/ManageWardsPage";
import ManageDoctorsPage from "./src/pages/ManageDoctorsPage";
import DashboardPage from "./src/pages/DashboardPage";
import AppointmentsPage from "./src/pages/AppointmentsPage";
import ReportsPage from "./src/pages/ReportsPage";

export const NAV_ITEMS = [
  { id: "dashboard",       label: "Dashboard",               icon: "dashboard"      },
  { id: "admit",           label: "Admit Patient",           icon: "admit"          },
  { id: "transfer",        label: "Transfer Patient",        icon: "transfer"       },
  { id: "discharge",       label: "Discharge Patient",       icon: "discharge"      },
  { id: "treatment",       label: "Record Doctor Treatment", icon: "treatment"      },
  { id: "byWard",          label: "Patients by Ward",        icon: "ward"           },
  { id: "byTeam",          label: "Patients by Team",        icon: "team"           },
  { id: "patientDetails",  label: "Patient Details",         icon: "details"        },
  { id: "manageWards",     label: "Manage Wards",            icon: "manageWard"     },
  { id: "manageDoctors",   label: "Manage Doctor",    icon: "manageDoctors"  },
  { id: "appointments", label: "Appointments", icon: "appointments" },
  { id: "reports", label: "Reports", icon: "reports" },
];

export const PAGES = {
  dashboard:      DashboardPage,
  admit:          AdmitPatientPage,
  transfer:       TransferPatientPage,
  discharge:      DischargePatientPage,
  treatment:      TreatmentPage,
  byWard:         PatientsByWardPage,
  byTeam:         PatientsByTeamPage,
  patientDetails: PatientDetailsPage,
  manageWards:    ManageWardsPage,
  manageDoctors:  ManageDoctorsPage,
  appointments: AppointmentsPage,
  reports: ReportsPage,
};

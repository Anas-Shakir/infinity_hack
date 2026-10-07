import type { Project, User } from "./types";

export const DEMO_USERS: User[] = [
  { id: "ADMIN", name: "Admin", email: "admin@novaworks.example", role: "ADMIN", specialization: "Administrator" },
  { id: "PM01", name: "Ayesha Khan", email: "ayesha@novaworks.example", role: "MANAGER", specialization: "Web Project Manager" },
  { id: "PM02", name: "Bilal Ahmed", email: "bilal@novaworks.example", role: "MANAGER", specialization: "Mobile Project Manager" },
  { id: "PM03", name: "Hina Malik", email: "hina@novaworks.example", role: "MANAGER", specialization: "AI Project Manager" },
  { id: "DEV01", name: "Ali Raza", email: "ali@novaworks.example", role: "AGENT", specialization: "Full-stack Developer" },
  { id: "DEV02", name: "Hamza Shah", email: "hamza@novaworks.example", role: "AGENT", specialization: "Backend Developer" },
  { id: "DEV03", name: "Sara Noor", email: "sara@novaworks.example", role: "AGENT", specialization: "Mobile Developer" },
  { id: "DEV04", name: "Usman Tariq", email: "usman@novaworks.example", role: "AGENT", specialization: "Mobile Developer" },
  { id: "DEV05", name: "Zain Abbas", email: "zain@novaworks.example", role: "AGENT", specialization: "AI Developer" },
  { id: "DEV06", name: "Maryam Asif", email: "maryam@novaworks.example", role: "AGENT", specialization: "AI Developer" },
];

export const DEMO_PASSWORD = "Demo123!";

export const DEMO_PROJECTS: Project[] = [
  { id: "project-urban-cart", name: "UrbanCart Website", client: "UrbanCart Clothing", description: "A production-ready product catalog and demo cart. No real payments or inventory integration.", managerId: "PM01", manager: "Ayesha Khan", deadline: "2026-10-20", tasks: [
    { id: "task-uc-1", title: "Product catalog UI", description: "Build the responsive product catalog and filtering experience.", assigneeId: "DEV01", assignee: "Ali Raza", deadline: "2026-10-12", estimatedHours: 12 },
    { id: "task-uc-2", title: "Demo cart UI", description: "Create the customer-facing demo cart interactions.", assigneeId: "DEV01", assignee: "Ali Raza", deadline: "2026-10-15", estimatedHours: 8 },
    { id: "task-uc-3", title: "Product and cart APIs", description: "Create APIs for catalog data and demo cart operations.", assigneeId: "DEV02", assignee: "Hamza Shah", deadline: "2026-10-14", estimatedHours: 14 },
    { id: "task-uc-4", title: "Website integration and testing", description: "Integrate the frontend with the APIs and complete quality checks.", assigneeId: "DEV01", assignee: "Ali Raza", deadline: "2026-10-19", estimatedHours: 6 },
  ]},
  { id: "project-quick-serve", name: "QuickServe Mobile App", client: "QuickServe Services", description: "A mobile service booking experience for customers.", managerId: "PM02", manager: "Bilal Ahmed", deadline: "2026-10-24", tasks: [
    { id: "task-qs-1", title: "Login and profile screens", description: "Build the authentication and customer profile screens.", assigneeId: "DEV03", assignee: "Sara Noor", deadline: "2026-10-12", estimatedHours: 8 },
    { id: "task-qs-2", title: "Service booking screens", description: "Build the service selection and booking workflow.", assigneeId: "DEV03", assignee: "Sara Noor", deadline: "2026-10-17", estimatedHours: 12 },
    { id: "task-qs-3", title: "Booking and account APIs", description: "Create APIs for booking and account management.", assigneeId: "DEV02", assignee: "Hamza Shah", deadline: "2026-10-16", estimatedHours: 16 },
    { id: "task-qs-4", title: "Mobile integration and testing", description: "Connect the mobile screens and complete integration testing.", assigneeId: "DEV04", assignee: "Usman Tariq", deadline: "2026-10-22", estimatedHours: 10 },
  ]},
  { id: "project-helpdesk", name: "HelpDeskPro AI Assistant", client: "HelpDeskPro Solutions", description: "An AI assistant for FAQ document processing and human escalation.", managerId: "PM03", manager: "Hina Malik", deadline: "2026-10-22", tasks: [
    { id: "task-hd-1", title: "FAQ document processing", description: "Build ingestion and preparation for customer support documents.", assigneeId: "DEV06", assignee: "Maryam Asif", deadline: "2026-10-13", estimatedHours: 10 },
    { id: "task-hd-2", title: "Assistant answer generation", description: "Build answer generation from approved FAQ documents.", assigneeId: "DEV05", assignee: "Zain Abbas", deadline: "2026-10-17", estimatedHours: 14 },
    { id: "task-hd-3", title: "Human escalation flow", description: "Create a clear workflow for handing off unresolved requests.", assigneeId: "DEV05", assignee: "Zain Abbas", deadline: "2026-10-18", estimatedHours: 6 },
    { id: "task-hd-4", title: "Assistant evaluation and testing", description: "Evaluate responses and run end-to-end quality checks.", assigneeId: "DEV06", assignee: "Maryam Asif", deadline: "2026-10-21", estimatedHours: 8 },
  ]},
];

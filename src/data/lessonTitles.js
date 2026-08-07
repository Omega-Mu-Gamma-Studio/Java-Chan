/**
 * lessonTitles.js
 *
 * Lightweight static index of lesson id -> title and unit id -> title.
 * Generated from src/data/lessons/unitN/*.json and src/data/units/unitN.json.
 *
 * Kept separate from lessonService.js (which lazy-loads full lesson JSON)
 * because the Journal book needs titles for its table of contents without
 * paying the cost of loading every lesson's full phase content.
 *
 * Regenerate by re-running the extraction over src/data/lessons/ if lesson
 * titles change.
 */

export const LESSON_TITLES = {
  '1.1': 'What is Java?',
  '1.2': 'Setting Up & Your First Program',
  '1.3': 'Hello, World!',
  '1.4': 'Data Types & Variables',
  '1.5': 'Type Casting & Literals',
  '1.6': 'Operators',
  '1.7': 'Input & Output',
  '1.8': 'Control Flow — if/else',
  '1.9': 'Loops — for & while',
  '1.10': 'Arrays',
  '1.11': '2D Arrays & Matrices',
  '1.12': 'Methods',
  '1.13': 'Strings',
  '1.14': 'Intro to OOP — Classes & Objects',
  '1.15': 'Access Modifiers & Encapsulation',
  '2.1': 'Inheritance Basics',
  '2.2': 'Method Overriding',
  '2.3': 'The super Keyword',
  '2.4': 'Polymorphism',
  '2.5': 'Abstract Classes',
  '2.6': 'Interfaces',
  '2.7': 'Multiple Interfaces',
  '2.8': 'Packages',
  '2.9': 'Static Members',
  '2.10': 'Final Keyword',
  '2.11': 'Inner Classes',
  '2.12': 'Enum Types',
  '2.13': 'Object Class Methods',
  '2.14': 'Wrapper Classes & Autoboxing',
  '2.15': 'Unit 2 Review — Design Patterns Intro',
  '3.1': 'What Are Exceptions?',
  '3.2': 'try-catch-finally',
  '3.3': 'throw & throws',
  '3.4': 'Custom Exceptions',
  '3.5': 'try-with-resources',
  '3.6': 'Common Built-in Exceptions',
  '3.7': 'Byte Streams',
  '3.8': 'Character Streams',
  '3.9': 'Buffered Streams',
  '3.10': 'PrintWriter & Console I/O',
  '3.11': 'File Class & File Operations',
  '3.12': 'Serialization',
  '3.13': 'NIO Basics — Path & Files',
  '3.14': 'Working with CSV Files',
  '3.15': 'Unit 3 Review — Robust Programs',
  '4.1': 'Collections Framework Overview',
  '4.2': 'ArrayList',
  '4.3': 'LinkedList',
  '4.4': 'HashSet & TreeSet',
  '4.5': 'HashMap & TreeMap',
  '4.6': 'Generics',
  '4.7': 'Comparable & Comparator',
  '4.8': 'Iterator & For-Each',
  '4.9': 'Stack, Queue & Deque',
  '4.10': 'Intro to Multithreading',
  '4.11': 'Creating Threads',
  '4.12': 'Thread Synchronization',
  '4.13': 'Inter-thread Communication',
  '4.14': 'Executor Framework',
  '4.15': 'Unit 4 Review — Choosing the Right Tool',
  '5.1': 'Intro to JavaFX',
  '5.2': 'Your First JavaFX Window',
  '5.3': 'Layouts — VBox & HBox',
  '5.4': 'Layouts — GridPane & BorderPane',
  '5.5': 'Basic Controls',
  '5.6': 'Event Handling',
  '5.7': 'Styling with CSS',
  '5.8': 'FXML & Scene Builder Intro',
  '5.9': 'FXML — Wiring Controllers',
  '5.10': 'Observable Properties & Binding',
  '5.11': 'ListView & TableView',
  '5.12': 'Dialogs & Alerts',
  '5.13': 'Animation Basics',
  '5.14': 'Building a Mini App',
  '5.15': 'Unit 5 Review & Course Wrap-Up',
};

export const UNIT_TITLES = {
  1: 'OOP & Java Fundamentals',
  2: 'Inheritance & Interfaces',
  3: 'Exception Handling & I/O',
  4: 'Collections & Threads',
  5: 'JavaFX & UI',
};

/** '2.4' -> 2 (the unit number a lesson id belongs to) */
export const unitOf = (lessonId) => Number(String(lessonId).split('.')[0]);

/** Human title for a lesson id, falling back to the id itself if unknown. */
export const getLessonTitle = (lessonId) => LESSON_TITLES[lessonId] || lessonId;

/** Human title for a unit id. */
export const getUnitTitle = (unitId) => UNIT_TITLES[unitId] || `Unit ${unitId}`;

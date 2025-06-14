// src/App.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- DATA LAYER (The "Memory") ---
// Updated based on the "ME Flowchart Nov 2022.pdf" and "Program guide 2020.pdf".
// Course IDs now use the full number format (e.g., MATH 01.130).
// Prereqs are structured as an array of arrays to handle AND/OR logic.
// e.g., [['A'], ['B', 'C']] means (A) AND (B OR C).
// Added 'offeredSemesters' property to specify when a course is typically offered.
const COURSE_CATALOG = {
    // Year 1
    'MATH 01.130': { name: 'Calculus I', credits: 4, prereqs: [], type: 'math', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'CHEM 06.100': { name: 'Chemistry I', credits: 4, prereqs: [], type: 'science', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'CHEM 06.105': { name: 'Adv. College Chemistry I', credits: 4, prereqs: [], type: 'science', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'CS 01.104': { name: 'Intro Sci Prog: Matlab/CAD', credits: 3, prereqs: [], type: 'cs', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'ENGR 01.101': { name: '1st Yr Clinic I', credits: 2, prereqs: [], type: 'clinic', offeredSemesters: ['Fall'] },
    'RC-ELEC-1': { name: 'Rowan Core Elective', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },

    'MATH 01.131': { name: 'Calculus II', credits: 4, prereqs: [['MATH 01.130']], type: 'math', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'COMP 01.111': { name: 'College Comp I', credits: 3, prereqs: [], type: 'humanities', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'PHYS 00.220': { name: 'Introductory Mechanics', credits: 4, prereqs: [['MATH 01.130']], type: 'science', offeredSemesters: ['Fall', 'Spring'] },
    'ENGR 01.102': { name: '1st Yr Clinic II', credits: 2, prereqs: [['ENGR 01.101'],['MATH 01.130']], type: 'clinic', offeredSemesters: ['Spring'] },
    'ME 10.101': { name: 'Intro to Mech. Design', credits: 3, prereqs: [['ENGR 01.101']], type: 'me-core', offeredSemesters: ['Spring'] },

    // Year 2
    'MATH 01.230': { name: 'Calculus III', credits: 4, prereqs: [['MATH 01.131']], type: 'math', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'PHYS 00.222': { name: 'Intro Elect & Magnetism', credits: 4, prereqs: [['PHYS 00.220'], ['MATH 01.131']], type: 'science', offeredSemesters: ['Fall', 'Spring'] },
    'ENGR 01.201': { name: 'Sophomore Clinic I', credits: 4, prereqs: [['ENGR 01.102']], type: 'clinic', offeredSemesters: ['Fall'] }, // Credit changed to 4
    'ENGR 01.271': { name: 'Statics', credits: 2, prereqs: [['PHYS 00.220'], ['MATH 01.131']], type: 'engr-core', offeredSemesters: ['Fall', 'Spring'] },
    'ME 10.210': { name: 'Manuf & Meas Technology', credits: 2, prereqs: [['ME 10.101','PHYS 00.220']], type: 'me-core', offeredSemesters: ['Fall', 'Spring'] },
    
    'MATH 01.235': { name: 'Math for Engr Analysis', credits: 4, prereqs: [['MATH 01.230']], type: 'math', offeredSemesters: ['Fall', 'Spring'] },
    'MATH 01.210': { name: 'Linear Algebra', credits: 3, prereqs: [], type: 'math', offeredSemesters: ['Fall', 'Spring', 'Summer'] }, // Added for equivalency
    'MATH 01.231': { name: 'Ord Diff Equation', credits: 3, prereqs: [['MATH 01.230']], type: 'math', offeredSemesters: ['Fall', 'Spring', 'Summer'] }, // Alternative to MATH 01.235
    'ENGR 01.202': { name: 'Sophomore Clinic II', credits: 4, prereqs: [['ENGR 01.201']], type: 'clinic', offeredSemesters: ['Spring'] },
    'ENGR 01.291': { name: 'Dynamics', credits: 2, prereqs: [['ENGR 01.271']], type: 'engr-core', offeredSemesters: ['Fall', 'Spring'] },
    'ENGR 01.283': { name: 'Matls Sci. & Manuf.', credits: 3, prereqs: [['CHEM 06.100']], type: 'engr-core', offeredSemesters: ['Fall', 'Spring'] },
    'ME 10.310': { name: 'Intro Thermal-Fluid Sci.', credits: 4, prereqs: [['ME 10.210'],['CHEM 06.100','CHEM 06.105'], ['MATH 01.230']], type: 'me-core', offeredSemesters: ['Spring'] }, // Only Spring
    
    // Year 3
    'ENGR 01.303': { name: 'Junior Clinic I', credits: 2, prereqs: [['ENGR 01.202'], ['MATH 01.235'],['ENGR 01.291']], type: 'clinic', offeredSemesters: ['Fall'] },
    'ME 10.330': { name: 'Fluid Mechanics for ME', credits: 3, prereqs: [['ENGR 01.271'], ['MATH 01.235'], ['ME 10.310']], type: 'me-core', offeredSemesters: ['Fall'] }, // Only Fall
    'ENGR 01.273': { name: 'Strength of Materials', credits: 3, prereqs: [['ENGR 01.271']], type: 'engr-core', offeredSemesters: ['Fall'] }, // Only Fall
    'MATH 01.332': { name: 'Intro Numerical Analysis', credits: 3, prereqs: [['MATH 01.235'], ['CS 01.104']], type: 'math', offeredSemesters: ['Fall', 'Spring'] }, // Offered Fall/Spring
    'ECE 09.205': { name: 'Prin & Apps ECE for Non Majors', credits: 3, prereqs: [['PHYS 00.222'], ['CS 01.104'],['MATH 01.230']], type: 'me-core', offeredSemesters: ['Fall', 'Spring'] }, // required

    'ENGR 01.304': { name: 'Junior Clinic II', credits: 2, prereqs: [['ENGR 01.303']], type: 'clinic', offeredSemesters: ['Spring'] }, // Added Junior Clinic II
    'ME 10.335': { name: 'Heat Transfer for ME', credits: 3, prereqs: [['ME 10.330']], type: 'me-core', offeredSemesters: ['Spring'] },
    'ENGR 01.410': { name: 'Finite Element Analysis', credits: 3, prereqs: [['MATH 01.235'],['ENGR 01.273','ENGR 01.272']], type: 'engr-core', offeredSemesters: ['Fall', 'Spring'] }, // Offered Fall/Spring
    'ME 10.301': { name: 'Machine Design', credits: 4, prereqs: [['ENGR 01.273'], ['ENGR 01.291']], type: 'me-core', offeredSemesters: ['Fall', 'Spring'] }, // Offered Fall/Spring

    // Year 4
    'ENGR 01.403': { name: 'Senior Clinic I', credits: 2, prereqs: [['ENGR 01.304'],['ME 10.310']], type: 'clinic', offeredSemesters: ['Fall'] }, // Senior Clinic I, prereq Junior Clinic II
    'ME 10.342': { name: 'Quality & Reliability', credits: 3, prereqs: [['MATH 01.131','MATH 01.141']], type: 'me-core', offeredSemesters: ['Fall', 'Spring'] }, // Offered Fall/Spring
    'ME 10.345': { name: 'Dynamic Sys & Control', credits: 4, prereqs: [['ENGR 01.291'], ['MATH 01.235']], type: 'me-core', offeredSemesters: ['Fall', 'Spring'] }, // Offered Fall/Spring
    'TECH-ELEC-1': { name: 'Technical Elective I', credits: 3, prereqs: [], type: 'elective-tech', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
  
    'RC-ELEC-2': { name: 'Rowan Core Elective', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'ENGR 01.404': { name: 'Senior Clinic II', credits: 2, prereqs: [['ENGR 01.403']], type: 'clinic', offeredSemesters: ['Spring'] }, // Added Senior Clinic II
    'TECH-ELEC-2': { name: 'Technical Elective II', credits: 3, prereqs: [], type: 'elective-tech', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'BIZ-ELEC': { name: 'Business Elective', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'ETHICS-ELEC': { name: 'Ethics Elective', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'RC-ELEC-3': { name: 'Rowan Core Elective', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },

    // Added Ethics Electives
    'PHIL 09.250': { name: 'Ethics and the Environment', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'PHIL 09.323': { name: 'Biomedical Ethics', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'PHIL 09.341': { name: 'Engineering Ethics', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'PHIL 09.346': { name: 'Professional Ethics', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'PHIL 09.392': { name: 'Applied Ethics', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'PHIL 09.393': { name: 'Moral Philosophy', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'INTR 01.148': { name: 'Ethical Decision Making', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'INTR 01.174': { name: 'Ethics in Engineering and Technology', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },

    // Added Business Electives
    'ECON 04.101': { name: 'Intro to Macroeconomics', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'ECON 04.102': { name: 'Intro to Microeconomics', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'INTR 01.138': { name: 'Introduction to Entrepreneurship', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'BUS 01.105': { name: 'Introduction to Business', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'ENT 06.240': { name: 'Entrepreneurship & Innovation', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'ENT 06.346': { name: 'Global Growth Strategies', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'ENT 06.450': { name: 'New Venture Development', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },
    'MIS 02.526': { name: 'Project Management for Engineers', credits: 3, prereqs: [], type: 'elective-gen', offeredSemesters: ['Fall', 'Spring', 'Summer'] },

    // Added Technical Electives (with titles from search, assumed 3 credits unless specified)
    'ENGR 01.411': { name: 'Introduction to Engineering Optimization', credits: 3, prereqs: [], type: 'elective-tech', offeredSemesters: ['Fall', 'Spring'] }, // From search
    'ENGR 01.413': { name: 'Technical Elective (Unconfirmed Title)', credits: 3, prereqs: [], type: 'elective-tech', offeredSemesters: ['Fall', 'Spring'] }, // No clear title from search, placeholder
    'ME 10.442': { name: 'Mechatronics', credits: 3, prereqs: [], type: 'elective-tech', offeredSemesters: ['Fall', 'Spring'] }, // From search
    'ME 10.450': { name: 'Introduction to Advanced Solid Mechanics', credits: 3, prereqs: [], type: 'elective-tech', offeredSemesters: ['Fall', 'Spring'] }, // From search/Coursicle list
    'ME 10.443': { name: 'Design for X', credits: 3, prereqs: [], type: 'elective-tech', offeredSemesters: ['Fall', 'Spring'] }, // From search
    'ME 10.405': { name: 'Special Topics in Mechanical Engineering', credits: 3, prereqs: [], type: 'elective-tech', offeredSemesters: ['Fall', 'Spring'] }, // From search (generic ST)
    'ME 10.422': { name: 'Computational Fluid Dynamics', credits: 3, prereqs: [], type: 'elective-tech', offeredSemesters: ['Fall', 'Spring'] }, // From search (assumed)
    'ME 10.440': { name: 'Introduction to Advanced Manufacturing', credits: 3, prereqs: [], type: 'elective-tech', offeredSemesters: ['Fall', 'Spring'] }, // From search
};

// Define colors for different course types to match flowchart aesthetics
const COURSE_TYPE_COLORS = {
    'math': { bg: 'bg-blue-50', text: 'text-gray-900' },        // Light blue for Math
    'science': { bg: 'bg-teal-50', text: 'text-gray-900' },     // Light teal for Science
    'cs': { bg: 'bg-indigo-50', text: 'text-gray-900' },      // Light indigo for CS
    'clinic': { bg: 'bg-orange-50', text: 'text-gray-900' },  // Light orange for Clinics
    'engr-core': { bg: 'bg-purple-50', text: 'text-gray-900' }, // Light purple for core Engr (Statics, etc.)
    'me-core': { bg: 'bg-green-50', text: 'text-gray-900' },   // Light green for ME specific core
    'elective-gen': { bg: 'bg-yellow-100', text: 'text-gray-900' }, // General electives (RC, Biz, Ethics) - a slightly deeper yellow
    'elective-tech': { bg: 'bg-red-50', text: 'text-gray-900' },   // Light red for Technical Electives
    'humanities': { bg: 'bg-lime-50', text: 'text-gray-900' }, // For College Comp I
};


// Updated based on the semester layout in "ME Flowchart Nov 2022.pdf".
// For OR choices, one path is chosen for the standard plan.
const STANDARD_PLAN = [
    // Year 1
    ['ENGR 01.101', 'MATH 01.130', 'CHEM 06.100', 'CS 01.104', 'RC-ELEC-1' ], // Sem 1 (16 credits)
    ['ENGR 01.102', 'MATH 01.131', 'COMP 01.111', 'PHYS 00.220',  'ME 10.101'], // Sem 2 (16 credits)
    // Year 2
    ['ENGR 01.201', 'MATH 01.230', 'PHYS 00.222', 'ME 10.210', 'ENGR 01.271'], // Sem 3 (16 credits) 
    ['ENGR 01.202', 'MATH 01.235', 'ENGR 01.283', 'ENGR 01.291', 'ME 10.310'], // Sem 4 (17 credits)
    // Year 3
    ['ENGR 01.303', 'ME 10.330', 'ENGR 01.273', 'ECE 09.205', 'RC-ELEC-2'], // Sem 5 (14 credits)
    ['ENGR 01.304', 'ME 10.335', 'ENGR 01.410', 'ME 10.301',  'MATH 01.332'], // Sem 6 (15 credits)
    // Year 4
    ['ENGR 01.403', 'ME 10.345', 'ME 10.342', 'RC-ELEC-3'], // Sem 7 (12 credits)
    ['ENGR 01.404', 'TECH-ELEC-1', 'TECH-ELEC-2', 'BIZ-ELEC', 'ETHICS-ELEC'], // Sem 8 (14 credits)
];

const COURSE_EQUIVALENTS = {
    // These would need to be mapped to the new course codes
    'CALC-A': 'MATH 01.130',
    'PHYS-E1': 'PHYS 00.220',
    'CHEM-1A': 'CHEM 06.100',
    'SET 01.113': 'CS 01.104', // CADD II to Intro Sci Prog: Matlab/CAD equivalent
    'CS 04.103': 'CS 01.104', // COMPUTER SCI & PROGM to Intro Sci Prog: Matlab/CAD equivalent
    'PHIL 09.150': 'ETHICS-ELEC', // Specific ethics elective to generic
    // Add other equivalent course mappings here as needed, especially from the transcript
    'JRN 02.210': 'RC-ELEC-1', // Example: Journalistic Writing could be a Rowan Core Elective
    'HIST 05.120': 'RC-ELEC-1', // Example: World History could be a Rowan Core Elective
    'HIST 05.150': 'RC-ELEC-1', // Example: US History could be a Rowan Core Elective
    'INTR 99.070': 'RC-ELEC-1', // Free elective to Rowan Core Elective (adjust as needed based on actual equivalency)
    'THD 08.135': 'RC-ELEC-1', // Elements of Dance to Rowan Core Elective
    'THD 08.246': 'RC-ELEC-1', // Fundamentals of Ballet Dance to Rowan Core Elective
    'THD 08.247': 'RC-ELEC-1', // Advanced Ballet to Rowan Core Elective
    'THD 08.256': 'RC-ELEC-1', // Fundamentals of Jazz Dance to Rowan Core Elective
    'THD 08.436': 'RC-ELEC-1', // Dance History - WI to Rowan Core Elective
    'ECON 04.101': 'BIZ-ELEC', // Intro Econ-Macro to Business Elective
    'ME 10.435': 'TECH-ELEC-1', // Intro to Wind Energy as a Technical Elective
    'MATH 01.210': 'MATH 01.210', // Explicitly add Linear Algebra
    'MATH 01.231': 'MATH 01.231', // Explicitly add Ordinary Differential Equation
};

// --- FAQ Content (Extracted from Rowan ME Advising Page) ---
const FAQ_CONTENT = `
**Who is my advisor?**
* **First-Year Students:** Your advisors are faculty and staff within Freshman Engineering, in coordination with the ME Department.
* **Sophomore, Junior, Senior Students:** You will have an assigned faculty advisor in the ME Department. Check DegreeWorks or your Rowan-ID.

**How do I get advised?**
* **First-Year Students:** Advising is through Freshman Engineering.
* **Sophomore, Junior, Senior Students:** You should schedule an advising meeting with your assigned faculty advisor. You will receive an email about this process.

**Can I get into a course that is full?
* Generally, no. Registration occurs in stages (based on earned credits), so registering early is crucial.
* If a course is required for your degree and is full, contact your advisor, and they may be able to help. Electives are usually not overridden.

**Can I waive a course?**
* No, courses cannot be waived. They can only be transferred in from other institutions. See the "Transferring Credits" section below.

**What is DegreeWorks?**
* DegreeWorks is an online tool that helps you track your academic progress towards graduation. It shows what courses you've completed, what's in progress, and what you still need to take. Access it via your Rowan-ID.

**How do I check course prerequisites?**
* Prerequisites are listed in the course catalog and in DegreeWorks. Ensuring you meet prerequisites is your responsibility.

**What minors are good with an ME degree?**
* Common minors include Biomedical Engineering, Business Administration, Computer Science, and various STEM fields. Discuss options with your advisor.

**How do I study abroad?**
* Start planning early, typically in your sophomore or junior year. Contact the Study Abroad office and your academic advisor to ensure courses transfer appropriately.
`;

// --- Helper function for prerequisite logic ---
const isPrereqMet = (prereqs, completedSet) => {
    if (!prereqs || prereqs.length === 0) return true;
    // Every item in the outer array (AND group) must be true
    return prereqs.every(orGroup => 
        // At least one item in the inner array (OR group) must be true
        orGroup.some(courseId => completedSet.has(courseId))
    );
};

// --- UI Components (Presentation Layer) ---
const Course = ({ courseId, status }) => {
    const course = COURSE_CATALOG[courseId];
    if (!course) return <div className="p-2 border rounded-lg bg-gray-200 text-sm">Unknown Course: {courseId}</div>;

    // Determine background color based on course type
    const typeColors = COURSE_TYPE_COLORS[course.type] || { bg: 'bg-gray-200', text: 'text-gray-900' }; // Default to gray background, dark text

    const statusStyles = {
        completed: 'border-green-400',
        available: 'border-blue-400',
        unavailable: 'border-red-400', // Border for unavailable
        planned: 'border-yellow-400',
    };

    return (
        <div className={`p-3 border-l-4 rounded-md shadow-sm transition-all duration-300 ${typeColors.bg} ${statusStyles[status]} ${status === 'unavailable' ? 'text-gray-500' : 'text-gray-900'}`}>
            {/* New compact format: Course Title (Credits) (Course Number) */}
            <p className="font-bold text-sm">
                {course.name} ({course.credits}) ({courseId})
            </p>
        </div>
    );
};

const Semester = ({ semesterData, semesterName, semesterIndex, completedCourses }) => {
    // semesterData now contains { courses, semesterCredits, cumulativeCredits }
    const { courses, semesterCredits, cumulativeCredits } = semesterData;

    return (
        <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">{semesterIndex + 1}. {semesterName}</h3>
            {/* Combined credits into one line */}
            <p className="mb-3 text-sm font-semibold text-gray-600">
                Semester Credits: {semesterCredits} / Cumulative Credits: {cumulativeCredits}
            </p>
            <div className="space-y-2">
                {courses.map(courseId => {
                    const courseInfo = COURSE_CATALOG[courseId];
                    if (!courseInfo) return <Course key={courseId} courseId={courseId} status="unavailable" />;
                    
                    let status = 'planned';
                    if (completedCourses.has(courseId)) {
                        status = 'completed';
                    } else if (isPrereqMet(courseInfo.prereqs, completedCourses)) {
                        status = 'available';
                    } else {
                        status = 'unavailable';
                    }
                    return <Course key={courseId} courseId={courseId} status={status} />;
                })}
            </div>
        </div>
    );
};

// Graduation Credits Target
const GRADUATION_CREDITS = 120;
const MIN_CREDITS_PER_SEMESTER = 12; // Minimum credits for full-time status
const MAX_CREDITS_PER_SEMESTER = 17; // A typical max credit load


// --- Main App Component ---
export default function App() {
    // Initial transcript input is empty to encourage upload or manual entry
    const [draftTranscriptInput, setDraftTranscriptInput] = useState(''); // Holds text area content
    const [transcriptInput, setTranscriptInput] = useState(''); // Actual transcript used for plan generation
    const [completedCourses, setCompletedCourses] = useState(new Set());
    const [uploadError, setUploadError] = useState('');
    const [showFaq, setShowFaq] = useState(false);

    // Chat states
    const [chatHistory, setChatHistory] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);


    // Helper functions to calculate holiday dates
    const getLaborDay = useCallback((year) => {
        const september1 = new Date(year, 8, 1); // September is month 8 (0-indexed)
        const dayOfWeek = september1.getDay(); // 0 = Sunday, 1 = Monday, ...
        const offset = dayOfWeek === 1 ? 0 : (dayOfWeek === 0 ? 1 : (8 - dayOfWeek)); // Calculate days until next Monday
        const laborDay = new Date(year, 8, 1 + offset);
        return laborDay;
    }, []);

    const getMLKDay = useCallback((year) => {
        const january1 = new Date(year, 0, 1);
        const dayOfWeek = january1.getDay();
        const firstMondayOffset = dayOfWeek === 1 ? 0 : (dayOfWeek === 0 ? 1 : (8 - dayOfWeek));
        const firstMondayInJan = new Date(year, 0, 1 + firstMondayOffset);
        // Add two weeks to get the third Monday
        const mlkDay = new Date(firstMondayInJan.getFullYear(), firstMondayInJan.getMonth(), firstMondayInJan.getDate() + 14);
        return mlkDay;
    }, []);

    const getThirdMondayInMay = useCallback((year) => {
        const may1 = new Date(year, 4, 1); // May is month 4 (0-indexed)
        const dayOfWeek = may1.getDay();
        const firstMondayOffset = dayOfWeek === 1 ? 0 : (dayOfWeek === 0 ? 1 : (8 - dayOfWeek));
        const firstMondayInMay = new Date(year, 4, 1 + firstMondayOffset);
        // Add two weeks to get the third Monday
        const thirdMondayInMay = new Date(firstMondayInMay.getFullYear(), firstMondayInMay.getMonth(), firstMondayInMay.getDate() + 14);
        return thirdMondayInMay;
    }, []);


    const { initialStartSemester, initialStartYear } = useMemo(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        let startSemester = 'Fall';
        let startYear = currentYear;

        const laborDayCurrentYear = getLaborDay(currentYear);
        const mlkDayCurrentYear = getMLKDay(currentYear);
        const thirdMondayMayCurrentYear = getThirdMondayInMay(currentYear);

        // Determine initial semester based on current date relative to holidays
        if (today >= new Date(laborDayCurrentYear.getFullYear(), laborDayCurrentYear.getMonth(), laborDayCurrentYear.getDate() + 1)) {
            // If today is after Labor Day, it's Fall semester of current year
            startSemester = 'Fall';
            startYear = currentYear;
        } else if (today >= new Date(thirdMondayMayCurrentYear.getFullYear(), thirdMondayMayCurrentYear.getMonth(), thirdMondayMayCurrentYear.getDate() + 1)) {
            // If today is after Third Monday in May and before Labor Day, it's Summer.
            // Plan starts next Fall semester.
            startSemester = 'Fall';
            startYear = currentYear; 
        } else if (today >= new Date(mlkDayCurrentYear.getFullYear(), mlkDayCurrentYear.getMonth(), mlkDayCurrentYear.getDate() + 1)) {
            // If today is after MLK day and before Third Monday in May, it's Spring semester of current year
            startSemester = 'Spring';
            startYear = currentYear;
        } else {
            // If none of the above (before MLK day), it's end of previous year or very start of current year before Spring begins.
            // Plan starts in the Spring of the current year.
            startSemester = 'Spring';
            startYear = currentYear;
        }
        
        // Handle cases where the current date is late in the calendar year (e.g., after Fall registration ends for current year)
        // This ensures the plan always starts for a plausible *future* semester.
        if (today.getMonth() > 9 && startSemester === 'Fall') { // If it's Oct, Nov, Dec and current plan starts Fall, push to next Spring
             startSemester = 'Spring';
             startYear = currentYear + 1; // Corrected: Use 'year' instead of 'startYear' to pass to getSemesterDisplayName
        } else if (today.getMonth() > 4 && today.getMonth() < 8 && startSemester === 'Spring') { // If it's Summer months (May-Aug) and current plan starts Spring, push to next Fall
             startSemester = 'Fall';
             startYear = currentYear; // Corrected: Use 'year' instead of 'startYear'
        }


        return { initialStartSemester: startSemester, initialStartYear: startYear };
    }, [getLaborDay, getMLKDay, getThirdMondayInMay]);


    // Function to calculate semester names
    const getSemesterDisplayName = useCallback((index) => {
        let year = initialStartYear;
        let semesterType = initialStartSemester;

        // Calculate year and semester type based on the semester index
        // Each year has two primary semesters (Fall, Spring)
        // If initial semester is Fall, then index 0 is Fall, 1 is Spring, 2 is Fall, etc.
        // If initial semester is Spring, then index 0 is Spring, 1 is Fall, 2 is Spring, etc.
        let actualSemester = '';
        if (initialStartSemester === 'Fall') {
            actualSemester = index % 2 === 0 ? 'Fall' : 'Spring';
            year = initialStartYear + Math.floor(index / 2);
        } else { // initialStartSemester === 'Spring'
            actualSemester = index % 2 === 0 ? 'Spring' : 'Fall';
            year = initialStartYear + Math.floor(index / 2);
            // If it's an odd index (i.e., the Fall semester following a Spring start), increment year
            if (index % 2 !== 0) { 
                 year++;
            }
        }
        return `${actualSemester} ${year}`;
    }, [initialStartSemester, initialStartYear]);


    // Helper to format course IDs from input (handle spaces and dots, or full course names)
    const formatCourseId = useCallback((courseInput) => {
        let formatted = courseInput.trim();

        // First, try to match by full course name (case-insensitive)
        for (const courseId in COURSE_CATALOG) {
            if (COURSE_CATALOG.hasOwnProperty(courseId)) {
                if (COURSE_CATALOG[courseId].name.toLowerCase() === formatted.toLowerCase()) {
                    return courseId;
                }
            }
        }

        // If not found by name, try to format as a course number
        formatted = formatted.toUpperCase(); // Convert to uppercase for number formatting

        // Regex to capture typical "SUBJ NN.NNN" or "SUBJ N.NNN" format (e.g., MATH 01.130, ME 10.330)
        // This will correctly extract the subject and the full number.
        const courseRegex = /^([A-Z]{2,5})\s*(\d{1,2}\.\d{1,3})$/; 
        const match = formatted.match(courseRegex);

        if (match) {
            // Reconstruct with consistent spacing if needed
            return `${match[1]} ${match[2]}`;
        }
        
        // Handle common short forms or variations from transcript examples if main regex fails
        // Example: MATH-130 -> MATH 01.130
        const shortFormPatterns = {
            // The original transcript often has subject and number without leading zeros in the first part,
            // or without the dot and last two digits (e.g., "CHEM 06100" vs "CHEM 06.100")
            // These patterns try to normalize those.
            'MATH\\s*(\\d{1,2})\\.?(\\d{3})': 'MATH $1.$2', // Handles MATH 130, MATH 01130 -> MATH 01.130
            'CHEM\\s*(\\d{1,2})\\.?(\\d{3})': 'CHEM $1.$2', // CHEM 100, CHEM 06100 -> CHEM 06.100
            'PHYS\\s*(\\d{1,2})\\.?(\\d{3})': 'PHYS $1.$2', // PHYS 220, PHYS 00220 -> PHYS 00.220
            'CS\\s*(\\d{1,2})\\.?(\\d{3})': 'CS $1.$2',     // CS 104, CS 01104 -> CS 01.104
            'ENGR\\s*(\\d{1,2})\\.?(\\d{3})': 'ENGR $1.$2', // ENGR 101, ENGR 01101 -> ENGR 01.101
            'ME\\s*(\\d{1,2})\\.?(\\d{3})': 'ME $1.$2',     // ME 101, ME 10101 -> ME 10.101 (assuming typical ME numbering)
            'COMP\\s*(\\d{1,2})\\.?(\\d{3})': 'COMP $1.$2',
            'ECE\\s*(\\d{1,2})\\.?(\\d{3})': 'ECE $1.$2',
            'PHIL\\s*(\\d{1,2})\\.?(\\d{3})': 'PHIL $1.$2',
            'INTR\\s*(\\d{1,2})\\.?(\\d{3})': 'INTR $1.$2',
            'BUS\\s*(\\d{1,2})\\.?(\\d{3})': 'BUS $1.$2',
            'ENT\\s*(\\d{1,2})\\.?(\\d{3})': 'ENT $1.$2',
            'MIS\\s*(\\d{1,2})\\.?(\\d{3})': 'MIS $1.$2',
            'ECON\\s*(\\d{1,2})\\.?(\\d{3})': 'ECON $1.$2',
            'CEE\\s*(\\d{1,2})\\.?(\\d{3})': 'CEE $1.$2',
            'HIST\\s*(\\d{1,2})\\.?(\\d{3})': 'HIST $1.$2',
            'JRN\\s*(\\d{1,2})\\.?(\\d{3})': 'JRN $1.$2',
            'SET\\s*(\\d{1,2})\\.?(\\d{3})': 'SET $1.$2',
            'THD\\s*(\\d{1,2})\\.?(\\d{3})': 'THD $1.$2',
        };

        for (const pattern in shortFormPatterns) {
            const regex = new RegExp(pattern);
            if (formatted.match(regex)) {
                return formatted.replace(regex, shortFormPatterns[pattern]);
            }
        }
        
        // Handle generic elective codes if they exist in the catalog as-is
        if (formatted.startsWith('RC-ELEC') || formatted.startsWith('TECH-ELEC') || 
            formatted.startsWith('BIZ-ELEC') || formatted.startsWith('ETHICS-ELEC')) {
            return formatted;
        }

        // If nothing matches standard formats, return the original input. 
        // Filtering later will handle invalid ones.
        return formatted;
    }, []);


    // Handle file upload
    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file type. Only allow text files for simplicity.
            if (!file.type.startsWith('text/')) {
                setUploadError('Please upload a plain text file (.txt, .csv). PDF and other formats are not supported for direct parsing.');
                return;
            }

            setUploadError(''); // Clear any previous error
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                // Parse transcript content line by line for courses
                const lines = content.split('\n');
                let coursesFound = [];
                // More flexible regex to capture Subject and Course Number,
                // accounting for potential missing dots or different number formats.
                const courseLineRegex = /^\s*([A-Z]{2,5})\s*(\d+\s*\.?\s*\d*)\s+.*?\s+([A-Z][+-]?|P|NP|W|TA)\s+(\d+\.\d{3})/i;
                
                lines.forEach(line => {
                    const match = line.match(courseLineRegex);
                    if (match) {
                        const subject = match[1];
                        const courseNumberRaw = match[2].replace(/\s/g, ''); // Remove any spaces in number like "01. 101"
                        const courseCode = `${subject} ${courseNumberRaw}`;
                        const grade = match[3].toUpperCase();
                        
                        // Only consider courses with a passing grade (A, B, C, D, P, TA - Transfer Accepted)
                        if (!['F', 'W', 'NG', 'R'].includes(grade) && !grade.startsWith('F')) { // Added 'R' for Retake/Repeat
                            coursesFound.push(formatCourseId(courseCode));
                        }
                    } else {
                        // Additional regex to catch courses listed without grades, but with "Credit Hours"
                        // This might be for "TRANSFER CREDIT ACCEPTED BY INSTITUTION" sections
                        const transferCourseRegex = /^\s*([A-Z]{2,5})\s*(\d+\s*\.?\s*\d*)\s+.*?\s+(TA)\s+(\d+\.\d{3})/i;
                        const transferMatch = line.match(transferCourseRegex);
                        if (transferMatch) {
                             const subject = transferMatch[1];
                             const courseNumberRaw = transferMatch[2].replace(/\s/g, '');
                             const courseCode = `${subject} ${courseNumberRaw}`;
                             coursesFound.push(formatCourseId(courseCode));
                        }
                    }
                });

                // Set draft and then commit to transcriptInput for plan generation
                const uniqueCourses = Array.from(new Set(coursesFound)).join(', ');
                setDraftTranscriptInput(uniqueCourses);
                setTranscriptInput(uniqueCourses); 
            };
            reader.onerror = () => {
                setUploadError('Failed to read file. Please try again.');
            };
            reader.readAsText(file);
        }
    }, [formatCourseId]); // Depend on formatCourseId as it's used within

    // Function to apply the draft transcript to trigger plan generation
    const applyTranscript = useCallback(() => {
        setTranscriptInput(draftTranscriptInput);
    }, [draftTranscriptInput]);


    const { academicPlan, messages, finalCumulativeCredits } = useMemo(() => {
        const localMessages = [];
        const studentCompletedInitial = new Set(
            transcriptInput
                .split(',')
                .map(c => formatCourseId(c)) // Use the new formatting helper
                .filter(c => c)
                .map(c => COURSE_EQUIVALENTS[c] || c)
                .filter(c => COURSE_CATALOG[c]) // Only add valid course IDs to completed set
        );

        // --- Handle MATH 01.235 equivalency: MATH 01.210 (3) + MATH 01.231 (3) = MATH 01.235 (4) ---
        // If student has both MATH 01.210 AND MATH 01.231, treat MATH 01.235 as completed.
        // This is applied before calculating remaining courses to ensure the plan doesn't try to schedule MATH 01.235.
        if (studentCompletedInitial.has('MATH 01.210') && studentCompletedInitial.has('MATH 01.231')) {
            studentCompletedInitial.add('MATH 01.235');
            localMessages.push({ type: 'info', text: 'Note: MATH 01.235 is considered completed due to your completion of MATH 01.210 and MATH 01.231.' });
        }


        let allCoursesInPlan = new Set(STANDARD_PLAN.flat());
        let remainingCourses = new Set([...allCoursesInPlan].filter(c => !studentCompletedInitial.has(c)));
        
        let currentCompleted = new Set(studentCompletedInitial);
        let currentCumulativeCredits = 0; // Initialize cumulative credits
        
        // Add credits from initially completed courses
        studentCompletedInitial.forEach(courseId => {
            currentCumulativeCredits += COURSE_CATALOG[courseId]?.credits || 0;
        });

        const generatedPlan = [];
        let semesterIndex = 0;
        
        // Loop through semesters until all courses are planned or a limit is reached
        while (remainingCourses.size > 0 && semesterIndex < 16) { // Increased limit for potential delays (e.g., 8 years worth of semesters)
            const availableNow = new Set();
            const currentSemesterType = getSemesterDisplayName(semesterIndex).split(' ')[0]; // 'Fall' or 'Spring'

            remainingCourses.forEach(courseId => {
                const courseInfo = COURSE_CATALOG[courseId];
                // Check if prerequisites are met AND if the course is offered in the current semester type
                // Junior & Senior year engineering core courses can't be transferred in unless approved by the department chair.
                // For this simulation, we assume if they are *not* already completed and are core, they must be taken at Rowan.
                // This means we primarily just check if they are available and prereqs met.
                const isJuniorSeniorCore = ['ENGR 01.303', 'ENGR 01.304', 'ENGR 01.403', 'ENGR 01.404', 
                                            'ME 10.330', 'ME 10.335', 'ME 10.301', 'ME 10.342', 'ME 10.345', 'ENGR 01.410'].includes(courseId);

                if (courseInfo && isPrereqMet(courseInfo.prereqs, currentCompleted) && 
                    courseInfo.offeredSemesters.includes(currentSemesterType)) {
                    availableNow.add(courseId);
                }
            });

            if (availableNow.size === 0 && remainingCourses.size > 0) {
                 const firstStuck = [...remainingCourses].find(c => {
                    const courseInfo = COURSE_CATALOG[c];
                    // Check if course is stuck due to prerequisites or offering schedule
                    return courseInfo && (!isPrereqMet(courseInfo.prereqs, currentCompleted) || !courseInfo.offeredSemesters.includes(currentSemesterType));
                 });
                 if(firstStuck) {
                    const courseInfo = COURSE_CATALOG[firstStuck];
                    let reason = '';
                    if (!isPrereqMet(courseInfo.prereqs, currentCompleted)) {
                        const missingPrereqs = courseInfo.prereqs
                            .filter(orGroup => !orGroup.some(courseId => currentCompleted.has(courseId)))
                            .map(orGroup => `(${orGroup.join(' OR ')})`)
                            .join(' AND ');
                        reason += `missing prerequisites: ${missingPrereqs}.`;
                    }
                    if (courseInfo && !courseInfo.offeredSemesters.includes(currentSemesterType)) { // Added null check for courseInfo
                        reason += ` not offered in ${currentSemesterType}. Offered in: ${courseInfo.offeredSemesters.join(', ')}.`;
                    }
                    localMessages.push({type: 'error', text: `You are currently stuck. To take ${firstStuck}, you must first resolve: ${reason}`});
                 } else {
                    localMessages.push({type: 'error', text: `You are currently stuck. Check for circular dependencies, invalid course IDs, or courses that cannot be scheduled with current completions.`});
                 }
                 break;
            }

            let coursesToTake = [];
            let currentSemesterCredits = 0; // Initialize credits for the current semester being built

            const idealSemesterTemplate = STANDARD_PLAN[semesterIndex] || [];
            const isLastSemester = (semesterIndex === STANDARD_PLAN.length - 1);
            let techElectiveAddedThisSemester = false; // Flag to ensure at least one tech elective is tried first in last semester

            // For the last semester, explicitly try to add a tech elective first from the standard template if available
            if (isLastSemester) {
                const techElectiveToTake = [...remainingCourses].find(
                    c => COURSE_CATALOG[c]?.type === 'elective-tech' && availableNow.has(c)
                );
                if (techElectiveToTake) {
                    // Check if adding this tech elective exceeds max credits
                    if (currentSemesterCredits + (COURSE_CATALOG[techElectiveToTake]?.credits || 0) <= MAX_CREDITS_PER_SEMESTER) {
                        coursesToTake.push(techElectiveToTake);
                        currentSemesterCredits += (COURSE_CATALOG[techElectiveToTake]?.credits || 0);
                        // Mark as handled to avoid re-adding later in this same semester's loop
                        currentCompleted.add(techElectiveToTake); 
                        remainingCourses.delete(techElectiveToTake);
                        availableNow.delete(techElectiveToTake); // Remove from available so it's not picked again
                        techElectiveAddedThisSemester = true;
                    }
                }
            }


            // Now, add other courses from the ideal semester template
            for (const courseId of idealSemesterTemplate) {
                // Ensure it's not already added (e.g., if it was the prioritized tech elective)
                // Also ensure it's still remaining and available after prior prioritizations
                if (!coursesToTake.includes(courseId) && availableNow.has(courseId) && remainingCourses.has(courseId)) {
                    // Apply mutual exclusivity rule if applicable
                    if ((courseId === 'MATH 01.332' && coursesToTake.includes('ECE 09.205')) ||
                        (courseId === 'ECE 09.205' && coursesToTake.includes('MATH 01.332'))) {
                        continue;
                    }
                    if (currentSemesterCredits + (COURSE_CATALOG[courseId]?.credits || 0) <= MAX_CREDITS_PER_SEMESTER) {
                        coursesToTake.push(courseId);
                        currentSemesterCredits += (COURSE_CATALOG[courseId]?.credits || 0);
                        currentCompleted.add(courseId);
                        remainingCourses.delete(courseId);
                        availableNow.delete(courseId);
                    }
                }
            }
            
            // Fill remaining slots with any other available courses
            // Iterate over a fresh list of available courses to ensure we respect modifications.
            const availableNowSnapshot = new Set();
            remainingCourses.forEach(courseId => { // Re-check remaining to get what's left
                 const courseInfo = COURSE_CATALOG[courseId];
                 if (courseInfo && isPrereqMet(courseInfo.prereqs, currentCompleted) && 
                     courseInfo.offeredSemesters.includes(currentSemesterType)) {
                     availableNowSnapshot.add(courseId);
                 }
            });


            for (const courseId of availableNowSnapshot) {
                if (!coursesToTake.includes(courseId) && (currentSemesterCredits + (COURSE_CATALOG[courseId]?.credits || 0) <= MAX_CREDITS_PER_SEMESTER)) {
                    // Apply mutual exclusivity rule
                    if ((courseId === 'MATH 01.332' && coursesToTake.includes('ECE 09.205')) ||
                        (courseId === 'ECE 09.205' && coursesToTake.includes('MATH 01.332'))) {
                        continue;
                    }

                    // Special handling for remaining technical electives if none added yet in the last semester
                    // This catches any tech electives not in the standard template but still needed/available
                    if (isLastSemester && !techElectiveAddedThisSemester && COURSE_CATALOG[courseId]?.type === 'elective-tech') {
                        coursesToTake.push(courseId);
                        currentSemesterCredits += (COURSE_CATALOG[courseId]?.credits || 0);
                        currentCompleted.add(courseId);
                        remainingCourses.delete(courseId);
                        techElectiveAddedThisSemester = true; // Mark that a tech elective has been added
                    } else if (!isLastSemester || techElectiveAddedThisSemester || COURSE_CATALOG[courseId]?.type !== 'elective-tech') {
                        // For non-last semesters, or if a tech elective is already added in the last semester,
                        // or if it's not a tech elective, just add if it's not a general elective.
                        // General electives are filled last unless explicitly part of standard plan
                        const courseType = COURSE_CATALOG[courseId]?.type;
                        const isGeneralElective = ['elective-gen'].includes(courseType);
                        
                        if (!isGeneralElective || idealSemesterTemplate.includes(courseId)) {
                             coursesToTake.push(courseId);
                             currentSemesterCredits += (COURSE_CATALOG[courseId]?.credits || 0);
                             currentCompleted.add(courseId);
                             remainingCourses.delete(courseId);
                        }
                    }
                }
            }

            // Ensure we don't exceed max courses per semester for visual layout
            coursesToTake = coursesToTake.slice(0, 6); 

            if(coursesToTake.length > 0) {
                generatedPlan.push({
                    courses: coursesToTake,
                    semesterCredits: currentSemesterCredits,
                    cumulativeCredits: currentCumulativeCredits + currentSemesterCredits // Update cumulative
                });
                coursesToTake.forEach(c => {
                    currentCompleted.add(c);
                    remainingCourses.delete(c);
                });
                currentCumulativeCredits += currentSemesterCredits; // Update global cumulative
            } else if (remainingCourses.size > 0 && availableNow.size > 0) {
                // This means courses are available, but couldn't be added perhaps due to credit limit in this iteration
                // We allow the loop to continue to try to schedule them in the next semester.
                // If this condition is hit repeatedly without progress, the outer semesterIndex limit will catch it.
            } else if (remainingCourses.size > 0) {
                 // No courses were added this semester and no courses are available. This indicates a stuck state.
                 break; // Exit loop if no progress can be made
            }
            semesterIndex++;

            // Add warning if semester credits are below minimum, only for semesters where courses were planned
            if (coursesToTake.length > 0 && currentSemesterCredits < MIN_CREDITS_PER_SEMESTER) {
                localMessages.push({ type: 'warning', text: `Semester ${getSemesterDisplayName(semesterIndex-1)} has ${currentSemesterCredits} credits, which is below the full-time minimum of ${MIN_CREDITS_PER_SEMESTER} credits. Consider adding more courses or electives.` });
            }
        }

        // Calculate total credits in the STANDARD_PLAN for comparison
        let standardPlanTotalCredits = 0;
        STANDARD_PLAN.forEach(semester => {
            semester.forEach(courseId => {
                // Ensure the course exists in the catalog before adding its credits
                standardPlanTotalCredits += COURSE_CATALOG[courseId]?.credits || 0;
            });
        });

        // Final graduation check message
        if (remainingCourses.size === 0) {
            if (currentCumulativeCredits >= GRADUATION_CREDITS) {
                localMessages.push({ type: 'success', text: `Congratulations! Your academic plan is complete, and you are on track to graduate with approximately ${currentCumulativeCredits} credits (target: ${GRADUATION_CREDITS}).` });
            } else {
                localMessages.push({ type: 'warning', text: `Your plan is complete, but you still need ${GRADUATION_CREDITS - currentCumulativeCredits} more credits to reach the graduation requirement of ${GRADUATION_CREDITS} credits.` });
            }
        } else if (localMessages.length === 0) { // No error messages, but courses remain
             localMessages.push({ type: 'warning', text: 'Some courses could not be scheduled within the generated plan. You may need to take summer courses, or adjust your load. Check for prerequisites and course offerings.' });
        }
        
        // Add a message about the standard plan's total credits
        if (standardPlanTotalCredits === GRADUATION_CREDITS) {
             localMessages.push({ type: 'info', text: `Note: The standard plan sums to the target ${GRADUATION_CREDITS} credits.` });
        } else {
            localMessages.push({ type: 'info', text: `Note: The standard plan totals ${standardPlanTotalCredits} credits. This is different from the ${GRADUATION_CREDITS} credit graduation target. You may need to take additional electives or courses.` });
        }


        return { academicPlan: generatedPlan, messages: localMessages, finalCumulativeCredits: currentCumulativeCredits };
    }, [transcriptInput, formatCourseId, initialStartSemester, initialStartYear, getSemesterDisplayName]); 

    // Effect to update completedCourses set when transcriptInput changes
    useEffect(() => {
        const studentCompleted = new Set(
            transcriptInput
                .split(',')
                .map(c => formatCourseId(c)) // Use the new formatting helper
                .filter(c => c)
                .map(c => COURSE_EQUIVALENTS[c] || c)
                .filter(c => COURSE_CATALOG[c]) // Ensure only valid course IDs are added
        );

        // Apply MATH 01.235 equivalency after initial processing
        if (studentCompleted.has('MATH 01.210') && studentCompleted.has('MATH 01.231')) {
            studentCompleted.add('MATH 01.235');
        }

        setCompletedCourses(studentCompleted);
    }, [transcriptInput, formatCourseId]);

    // Function to send message to AI
    const handleSendMessage = async () => {
        if (!userMessage.trim() || isThinking) return;

        const newUserMessage = userMessage.trim();
        setChatHistory(prev => [...prev, { role: 'user', text: newUserMessage }]);
        setUserMessage('');
        setIsThinking(true);

        try {
            // Your deployed Google Apps Script Web App URL
            const APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbySb7m1y3ux_PX7LDZocq9YJ5arkUn7kVjT468eePfyGrxQUCnw5ZvwSzNgHQ43jpbT/exec"; // PASTE THE URL YOU COPIED

            const payload = {
                userMessage: newUserMessage,
                faqContent: FAQ_CONTENT // Send the FAQ content as context
            };

            const response = await fetch(APPS_SCRIPT_WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Check if the response is OK (status 200-299)
            if (!response.ok) {
                const errorText = await response.text(); // Get raw error text from server
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json(); // Use await here, parsing the successful response

            if (result.response) { // Check for the 'response' property from Apps Script
                setChatHistory(prev => [...prev, { role: 'ai', text: result.response }]);
            } else if (result.error) {
                setChatHistory(prev => [...prev, { role: 'ai', text: "AI Error: " + result.error }]);
                console.error("Apps Script Error:", result.error);
            } else {
                setChatHistory(prev => [...prev, { role: 'ai', text: "I apologize, but I couldn't generate a response at this time (unexpected format). Please try again." }]);
                console.error("Unexpected Apps Script response:", result);
            }
        } catch (error) {
            console.error("Error communicating with Apps Script:", error);
            // Provide a more informative error message to the user
            setChatHistory(prev => [...prev, { role: 'ai', text: `I encountered a network error while processing your request. This might be due to an incorrect Apps Script URL, deployment settings, or an issue with the Google API. Please try again later. (Error details: ${error.message || error})` }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-blue-600">AI Academic Advisor</h1>
                    <p className="text-lg text-gray-600 mt-2">Your personalized guide for Mechanical Engineering.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Changed to 2 columns */}
                    <div className="lg:col-span-1 space-y-6"> {/* Left Column */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Transcript</h2>
                            <p className="text-sm text-gray-500 mb-3">Enter the course numbers or full course titles you have passed, separated by commas (e.g., MATH 01.130, Chemistry I, PHYS 00.220).</p> {/* Updated instruction */}
                            <textarea
                                value={draftTranscriptInput} // Bind to draft state
                                onChange={(e) => setDraftTranscriptInput(e.target.value)} // Update draft on change
                                className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
                                placeholder="e.g., MATH 01.130, Chemistry I, Statics, PHYS 00.220..."
                            />
                            <div className="mt-4 flex flex-col sm:flex-row items-center gap-2"> {/* Added flex for button */}
                                <label htmlFor="transcript-upload" className="block text-gray-700 text-sm font-bold sm:w-1/2">
                                    Or Upload a Text File:
                                </label>
                                <input
                                    id="transcript-upload"
                                    type="file"
                                    accept=".txt,.csv"
                                    onChange={handleFileUpload}
                                    className="block w-full text-sm text-gray-500
                                               file:mr-4 file:py-2 file:px-4
                                               file:rounded-full file:border-0
                                               file:text-sm file:font-semibold
                                               file:bg-blue-50 file:text-blue-700
                                               hover:file:bg-blue-100 cursor-pointer"
                                />
                                <button
                                    onClick={applyTranscript} // New button to apply transcript
                                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shrink-0 w-full sm:w-auto"
                                >
                                    Apply Courses
                                </button>
                            </div>
                            {uploadError && (
                                <p className="text-red-500 text-xs mt-2">{uploadError}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                                Accepted formats: .txt, .csv. For PDFs, please copy-paste the course numbers or titles into a text file first.
                                The system will attempt to parse common transcript layouts.
                            </p>
                        </div>

                        {/* FAQ Section */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 cursor-pointer flex justify-between items-center" onClick={() => setShowFaq(!showFaq)}>
                                Frequently Asked Questions
                                <span className="text-gray-500 text-xl">{showFaq ? '−' : '+'}</span>
                            </h2>
                            {showFaq && (
                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: FAQ_CONTENT.replace(/\n/g, '<br/>') }}>
                                    {/* FAQ content will be rendered here */}
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-4">
                                Source: <a href="https://engineering.rowan.edu/programs/mechanical/advising/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Rowan ME Advising Page</a>
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Advisor Notes</h2>
                            {messages.length === 0 ? (
                                <div className="flex items-start p-3 rounded-lg bg-green-50">
                                   <span className="text-xl mr-3 text-green-500">✓</span>
                                   <span className="text-gray-700">Looks good! Your generated plan is on track.</span>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {messages.map((msg, index) => (
                                       <li key={index} className={`flex items-start p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50' : msg.type === 'warning' ? 'bg-yellow-50' : msg.type === 'info' ? 'bg-blue-50' : 'bg-green-50'}`}>
                                           <span className={`text-xl mr-3 ${msg.type === 'error' ? 'text-red-500' : msg.type === 'warning' ? 'text-yellow-500' : msg.type === 'info' ? 'text-blue-500' : 'text-green-500'}`}>
                                               {msg.type === 'error' ? '!' : msg.type === 'warning' ? '⚠️' : msg.type === 'info' ? 'ℹ️' : '✓'}
                                           </span>
                                           <span className="text-gray-700">{msg.text}</span>
                                       </li>
                                    ))}
                                </ul>
                            )}
                            {finalCumulativeCredits !== undefined && (
                                <div className="mt-4 p-3 rounded-lg bg-gray-100 text-gray-700">
                                    <p className="font-semibold">Current Cumulative Credits: {finalCumulativeCredits}</p>
                                    <p className="font-semibold">Graduation Target: {GRADUATION_CREDITS} credits</p>
                                    {finalCumulativeCredits < GRADUATION_CREDITS && (
                                        <p className="text-red-600">You still need {GRADUATION_CREDITS - finalCumulativeCredits} credits to graduate.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Chatbox Section - Moved to left column */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Ask the Advisor</h2>
                            <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                                {chatHistory.length === 0 ? (
                                    <p className="text-gray-500 text-center">Ask me anything about ME advising!</p>
                                ) : (
                                    chatHistory.map((msg, index) => (
                                        <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                {msg.text}
                                            </span>
                                        </div>
                                    ))
                                )}
                                {isThinking && (
                                    <div className="text-center text-gray-500">
                                        <span className="animate-pulse">Thinking...</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex">
                                <input
                                    type="text"
                                    className="flex-grow p-3 border rounded-l-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    placeholder="Type your question here..."
                                    value={userMessage}
                                    onChange={(e) => setUserMessage(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !isThinking) {
                                            handleSendMessage();
                                        }
                                    }}
                                    disabled={isThinking}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-r-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isThinking}
                                >
                                    Send
                                </button>
                            </div>
                        </div> {/* End Chatbox Section */}
                    </div>

                    <div className="lg:col-span-1 space-y-6"> {/* Right Column */}
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">Your Generated Academic Plan</h2>
                        <p className="text-gray-600 mb-4 -mt-3">This is a suggested path to graduation based on your completed courses.</p>
                        <div className="space-y-6">
                           <div className="bg-white p-4 rounded-xl shadow-md">
                                <h3 className="text-xl font-semibold mb-3 text-gray-700">Completed Courses</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from(completedCourses).length > 0 ? Array.from(completedCourses).map(courseId => (
                                        <div key={courseId} className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-1.5 rounded-full">
                                            {courseId}
                                        </div>
                                    )) : <p className="text-sm text-gray-500">No courses entered yet.</p>}
                                </div>
                            </div>

                            {academicPlan.length > 0 ? (
                                academicPlan.map((semData, index) => (
                                    <Semester 
                                        key={index}
                                        semesterData={semData} // Pass the object with courses and credit info
                                        semesterName={getSemesterDisplayName(index)} // Pass formatted semester name
                                        semesterIndex={index} // Pass index for enumeration
                                        completedCourses={completedCourses}
                                    />
                                ))
                            ) : (
                               <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                   <p className="text-gray-600">Your plan is complete, or an error is preventing generation. Check the advisor notes.</p>
                               </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

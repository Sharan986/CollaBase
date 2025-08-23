// Sample teams data for testing
export const sampleTeams = [
  {
    title: "AI Study Buddy App",
    description: "Building a mobile app that uses AI to help students study more effectively. We're creating personalized study plans and AI tutoring features.",
    category: "Mobile App",
    skillsNeeded: ["React Native", "Python", "Machine Learning", "UI/UX"],
    teamSize: 4,
    currentMembers: 2,
    status: "recruiting",
    tags: ["ai", "mobile", "education"],
    createdBy: "sample_user_1",
    createdAt: new Date("2024-08-20"),
    members: [
      {
        userId: "sample_user_1",
        name: "Alex Chen",
        role: "Team Lead",
        skills: ["React Native", "JavaScript"]
      },
      {
        userId: "sample_user_2", 
        name: "Sarah Kim",
        role: "AI Developer",
        skills: ["Python", "Machine Learning"]
      }
    ],
    applications: []
  },
  {
    title: "Campus Event Manager",
    description: "A web platform to help student organizations manage and promote campus events. Features include event creation, RSVP tracking, and social sharing.",
    category: "Web App",
    skillsNeeded: ["React", "Node.js", "MongoDB", "CSS"],
    teamSize: 3,
    currentMembers: 1,
    status: "recruiting",
    tags: ["web", "social", "campus"],
    createdBy: "sample_user_3",
    createdAt: new Date("2024-08-22"),
    members: [
      {
        userId: "sample_user_3",
        name: "Mike Johnson",
        role: "Full Stack Developer",
        skills: ["React", "Node.js", "MongoDB"]
      }
    ],
    applications: []
  },
  {
    title: "Sustainable Campus Initiative",
    description: "Data analysis project to track and reduce campus carbon footprint. We're building dashboards and prediction models for sustainability metrics.",
    category: "Data Science",
    skillsNeeded: ["Python", "Data Analysis", "Tableau", "Research"],
    teamSize: 5,
    currentMembers: 3,
    status: "recruiting",
    tags: ["sustainability", "data", "research"],
    createdBy: "sample_user_4",
    createdAt: new Date("2024-08-21"),
    members: [
      {
        userId: "sample_user_4",
        name: "Emma Davis",
        role: "Data Scientist",
        skills: ["Python", "Data Analysis"]
      },
      {
        userId: "sample_user_5",
        name: "Tom Wilson",
        role: "Researcher",
        skills: ["Research", "Statistics"]
      },
      {
        userId: "sample_user_6",
        name: "Lisa Park",
        role: "Visualization Expert",
        skills: ["Tableau", "Design"]
      }
    ],
    applications: []
  },
  {
    title: "Gaming Tournament Platform",
    description: "Building a platform for organizing and managing gaming tournaments on campus. Includes bracket generation, live scoring, and streaming integration.",
    category: "Gaming",
    skillsNeeded: ["Vue.js", "Firebase", "Game Development", "UI/UX"],
    teamSize: 4,
    currentMembers: 2,
    status: "recruiting",
    tags: ["gaming", "tournament", "platform"],
    createdBy: "sample_user_7",
    createdAt: new Date("2024-08-19"),
    members: [
      {
        userId: "sample_user_7",
        name: "Jake Miller",
        role: "Frontend Developer",
        skills: ["Vue.js", "CSS"]
      },
      {
        userId: "sample_user_8",
        name: "Amy Chen",
        role: "UX Designer",
        skills: ["UI/UX", "Figma"]
      }
    ],
    applications: []
  }
];

// Function to add sample teams to Firestore (run once)
export async function addSampleTeams(db) {
  const { collection, addDoc } = await import('firebase/firestore');
  
  try {
    for (const team of sampleTeams) {
      await addDoc(collection(db, 'teams'), team);
      console.log('Added team:', team.title);
    }
    console.log('All sample teams added successfully!');
  } catch (error) {
    console.error('Error adding sample teams:', error);
  }
}
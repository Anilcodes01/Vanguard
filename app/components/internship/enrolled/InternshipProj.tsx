import InternshipProjectCard from "./InternshipProjectCard";
import { InternshipProjectCardProps } from "./InternshipProjectCard";


const DummyProjects: InternshipProjectCardProps[] = [
  {
    title: "AI-Powered Admin Manager",
    description:
      "An AI-powered admin manager which lets managers to manage their dashboard. It should be dynamic and all.",
    coverImage: "/images/projects/ai-admin.webp",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
    maxTime: "12 weeks",
  },
  {
    title: "E-commerce Platform",
    description:
      "A full-featured e-commerce platform with a modern, clean, and intuitive user interface.",
    coverImage: "/images/projects/ecommerce.png",
    techStack: ["React", "Node.js", "Express", "MongoDB", "Redux"],
    maxTime: "10 weeks",
  },
  {
    title: "Social Media App",
    description:
      "A social media application where users can share their thoughts and connect with others.",
    coverImage: "/images/projects/socailai.jpeg",
    techStack: ["Vue.js", "Firebase", "Vuetify", "Vuex"],
    maxTime: "8 weeks",
  },
  {
    title: "Task Management Tool",
    description:
      "A tool to help teams manage their tasks and projects efficiently.",
    coverImage: "/images/projects/socailai.jpeg",
    techStack: ["Angular", "NestJS", "GraphQL", "Apollo", "TypeORM"],
    maxTime: "14 weeks",
  },
];


export default function InternshipProj() {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-7xl lg:grid-cols-3 gap-12">
            {DummyProjects.map((project, index) => (
                <InternshipProjectCard 
                    key={project.title}
                    project={project}   
                />
            ))}
        </div>
    )
}
export const getPrepareData = async (req, res) => {
    try {
        const data = {
            hero: {
                badge: "Prepare",
                title: "Prepare for Modern Engineering Roles",
                flipWords: ["Accessibility", "Performance", "Security", "System Design"],
                description: "Meet the interview prep platform designed to simplify interviews for modern engineering roles."
            },
            roadmap: {
                title: "A simple yet comprehensive plan to follow",
                description: "Modern engineering interviews span frontend, backend, AI, and forward-deployed roles. Beyond role-specific concepts, many companies still assess core problem-solving and system fundamentals. We’ve condensed everything into a clear, structured strategy you can follow to master essential interview patterns—across roles.",
                steps: [
                    {
                        id: 1,
                        title: "SOLID Principles",
                        leftNodes: [
                            { text: "Accessibility", type: "secondary" },
                            { text: "JavaScript Functions", type: "secondary" }
                        ],
                        rightNodes: [
                            { text: "Front end system design", type: "secondary" },
                            { text: "DOM manipulation", type: "secondary" }
                        ]
                    },
                    {
                        id: 2,
                        title: "Backend with TypeScript",
                        leftNodes: [
                            { text: "React", type: "primary" }
                        ],
                        rightNodes: [
                            { text: "Internationalization", type: "primary" }
                        ]
                    },
                    {
                        id: 3,
                        title: "Front end system design",
                        leftNodes: [
                            { text: "Networking", type: "secondary" },
                            { text: "Data structures & algorithms", type: "secondary" }
                        ],
                        rightNodes: [
                            { text: "User interfaces", type: "secondary" },
                            { text: "Performance", type: "secondary" }
                        ]
                    }
                ]
            },
            cta: {
                title: "Your dream job is absolutely worth it",
                buttonText: "Get Started Now",
                subText: "200+ questions are free to do"
            }
        };

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
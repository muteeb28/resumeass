import { getJavaLessonBySlug } from "../../assets/data/java.lesson.data.js";

export const getJavaLesson = async (req, res) => {
    try {
        const { slug } = req.params;
        const lesson = getJavaLessonBySlug(slug);

        // Disable caching (equivalent to Next.js no-store)
        res.set("Cache-Control", "no-store");

        if (!lesson) {
            return res.status(404).json({ error: "Lesson not found" });
        }

        return res.status(200).json({
            course: lesson.course,
            chapter: lesson.chapter,
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            codeSnippet: lesson.codeSnippet,
            metadata: lesson.metadata ?? {}
        });

    } catch (error) {
        console.error("Failed to fetch lesson:", error);
        res.status(500).json({ error: "Failed to fetch lesson" });
    }
};
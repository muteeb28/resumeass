import Course from "../../model/course.model.js";

export const getCourses = async (req, res) => {
    try {
        const courses = await Course.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $sort: { order: 1 }
            },
            {
                $lookup: {
                    from: "modules",
                    localField: "_id",
                    foreignField: "courseId",
                    as: "modules"
                }
            },
            {
                $lookup: {
                    from: "topics",
                    localField: "modules._id",
                    foreignField: "moduleId",
                    as: "topics"
                }
            },
            {
                $addFields: {
                    moduleCount: { $size: "$modules" },
                    topicCount: { $size: "$topics" }
                }
            },
            {
                $project: {
                    id: "$_id",
                    slug: 1,
                    title: 1,
                    description: 1,
                    image: 1,
                    level: 1,
                    duration: 1,
                    tags: 1,
                    moduleCount: 1,
                    topicCount: 1
                }
            }
        ]);

        res.status(200).json({ courses });

    } catch (error) {
        console.error("Failed to fetch courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
};

export const getCourseBySlug = async (req, res) => {
    try {
        const { courseSlug } = req.params;

        const result = await Course.aggregate([
            {
                $match: { slug: courseSlug }
            },
            {
                $lookup: {
                    from: "modules",
                    localField: "_id",
                    foreignField: "courseId",
                    as: "modules"
                }
            },
            {
                $unwind: {
                    path: "$modules",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "topics",
                    localField: "modules._id",
                    foreignField: "moduleId",
                    as: "modules.topics"
                }
            },
            {
                $unwind: {
                    path: "$modules.topics",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "lessons",
                    localField: "modules.topics.lessonId",
                    foreignField: "_id",
                    as: "lesson"
                }
            },
            {
                $addFields: {
                    "modules.topics.lessonId": {
                        $ifNull: [{ $arrayElemAt: ["$lesson._id", 0] }, null]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        courseId: "$_id",
                        moduleId: "$modules._id"
                    },
                    course: { $first: "$$ROOT" },
                    module: { $first: "$modules" },
                    topics: {
                        $push: {
                            id: "$modules.topics._id",
                            title: "$modules.topics.title",
                            xp: "$modules.topics.xp",
                            order: "$modules.topics.order",
                            isFree: "$modules.topics.isFree",
                            lessonId: "$modules.topics.lessonId"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.courseId",
                    course: { $first: "$course" },
                    modules: {
                        $push: {
                            id: "$module._id",
                            title: "$module.title",
                            order: "$module.order",
                            topics: "$topics"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    course: {
                        id: "$course._id",
                        slug: "$course.slug",
                        title: "$course.title",
                        description: "$course.description",
                        image: "$course.image",
                        level: "$course.level",
                        duration: "$course.duration",
                        tags: "$course.tags"
                    },
                    modules: {
                        $sortArray: {
                            input: "$modules",
                            sortBy: { order: 1 }
                        }
                    }
                }
            }
        ]);

        if (!result.length) {
            return res.status(404).json({ error: "Course not found" });
        }

        // Sort topics inside each module
        const response = result[0];
        response.modules = response.modules.map((mod) => ({
            ...mod,
            topics: mod.topics
                .filter(t => t.id) // remove nulls
                .sort((a, b) => a.order - b.order)
        }));

        res.status(200).json(response);

    } catch (error) {
        console.error("Failed to fetch course:", error);
        res.status(500).json({ error: "Failed to fetch course" });
    }
};

import { replaceMongoIdInObject } from '@/lib/convertData';
import Lesson from '@/modals/lessons-modal';
import Module from '@/modals/modules-modal';

export const getModuleById = async (moduleId) => {
    try {
        const getModule = await Module.findById(moduleId)
            .populate({
                path: 'lessonIds',
                model: Lesson
            })
            .lean();
        return replaceMongoIdInObject(getModule);
    } catch (error) {
        throw new Error(error);
    }
};
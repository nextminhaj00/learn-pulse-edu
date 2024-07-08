import { getCoursesByInstructorId } from '@/queries/courses';
import { columns } from './_components/columns';
import { DataTable } from './_components/data-table';
import { getUserData } from '@/lib/getUserData';

export const dynamic = 'force-dynamic';

const CoursesPage = async () => {
    const user = await getUserData();
    const courses = await getCoursesByInstructorId(user?.id);

    return (
        <div className='p-6'>
            <DataTable columns={columns} data={courses} />
        </div>
    );
};

export default CoursesPage;

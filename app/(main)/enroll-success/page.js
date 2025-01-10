import CourseAccessLink from '@/components/globals/CourseAccessLink/CourseAccessLink';
import { Button } from '@/components/ui/button';
import { sendEmails } from '@/lib/emails';
import { stripe } from '@/lib/stripe';
import { getCourseDetails } from '@/queries/courses';
import { enrollForCourse } from '@/queries/enrollments';
import { getUserByEmail } from '@/queries/users';
import { CircleCheck } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const PaymentSuccessPage = async ({ searchParams: { session_id, courseId } }) => {
    const { user } = await getServerSession();
    if (!user.email) {
        redirect('/login');
    }

    const logInUser = await getUserByEmail(user?.email);
    const { course } = await getCourseDetails(courseId);

    // Check Out Session
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['line_items', 'payment_intent']
    });

    // Customer info
    const customerName = `${logInUser?.firstName} ${logInUser?.lastName}`;
    const customerEmail = logInUser?.email;
    const productName = course?.title;

    const paymentStatus = checkoutSession?.payment_intent?.status;
    if (paymentStatus === 'succeeded') {
        // Enroll for the course
        try {
            const enrollData = {
                user_id: logInUser?.id,
                course_id: course?.id,
                status: 'complete',
                method: 'stripe'
            };
            const enrolled = await enrollForCourse(enrollData);

            // Send Emails to the instructor, student,and the person
            if (enrolled?.success) {
                const instructorName = `${course?.instructor?.firstName} ${course?.instructor?.lastName}`;
                const instructorEmail = course?.instructor?.email;

                const emailsToSend = [
                    {
                        to: instructorEmail,
                        subject: `New Enrollment for ${productName}.`,
                        message: `Congratulations, ${instructorName}.
    A new student, ${customerName} has enrolled in your course ${productName} just now.
    Please check the instructor dashboard and give a high-five to your new student.`
                    },
                    {
                        to: customerEmail,
                        subject: `Enrollment Success for ${productName}`,
                        message: `Hey ${customerName} You have successfully enrolled for the course ${productName}`
                    }
                ];

                // Sent Email By Student
                await sendEmails(emailsToSend);
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    return (
        <div className='flex flex-col items-center justify-center flex-1 w-full h-full font-poppins'>
            <div className='flex flex-col items-center gap-6 max-w-[600px] text-center'>
                {paymentStatus === 'succeeded' && (
                    <>
                        <CircleCheck className='w-32 h-32 p-0 text-white rounded-full bg-success' />
                        <h1 className='text-xl md:text-2xl lg:text-3xl'>
                            Congratulations, <strong>{customerName}</strong>! Your Enrollment was
                            Successful for <strong>{productName}</strong>
                        </h1>
                    </>
                )}
                <div className='flex items-center gap-3'>
                    <Button asChild size='sm'>
                        <Link href='/account/enrolled-courses'>Browse Courses</Link>
                    </Button>
                    <CourseAccessLink
                        className='text-black dark:text-white'
                        courseId={courseId}
                        variant='outline'
                        size='sm'
                    >
                        Play Course
                    </CourseAccessLink>
                </div>
            </div>
        </div>
    );
};
export default PaymentSuccessPage;

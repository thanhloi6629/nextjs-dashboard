'use server';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { string, z } from 'zod';
import useToastify from '../hooks/useToastify';

export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };


const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({ invalid_type_error: 'Please select a customer' }),
    amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], { invalid_type_error: 'Please select a status' }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true});

export async function createInvoice(prevState: State , formData: FormData) {
    console.log('prevStateá', prevState)

   console.log('formData', formData);
   const validatedFields = CreateInvoice.safeParse ({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to create invoice',
        };
    }

    const {amount, customerId, status} = validatedFields.data
    console.log('T-amount', amount);
    console.log('T-customerId', customerId);
    console.log('T-status', status);

    try {
        // const {amount, customerId, status} = CreateInvoice.parse({
        //     customerId: formData.get('customerId'),
        //     amount: formData.get('amount'),
        //     status: formData.get('status')
        // });

        // if(!validatedFields.success) {
        //     return {errors: validatedFields.error.errors};
        // }

        const amountInCents = amount * 100;
        const date = new Date().toISOString().split('T')[0];

        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
       
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
          };
    }
    revalidatePath('dashboard/invoices');
    redirect('/dashboard/invoices');
  

}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    const notify = useToastify()
    const {errorNotification, successNotification} = notify
    const rawFormData = {
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    };

    const validatedFields = UpdateInvoice.safeParse(rawFormData);
    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    // const date = new Date().toISOString().split('T')[0];
    
    try {
        const result = await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
        `;
        if(result.rowCount > 0) {
            console.log('Cập nhật thành công')
            successNotification();
        //     revalidatePath('dashboard/invoices');
        //     redirect('dashboard/invoices');
        // } else {
        //     console.log('Cập nhật có lỗi')
        }
     
    } catch (error) {
        console.log('L-error', error);
        errorNotification();
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
   
}



export async function deleteInvoice(id: string) {
    // throw new Error('Failed to Delete Invoice');
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice' };
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Invoice' };
    }
  }


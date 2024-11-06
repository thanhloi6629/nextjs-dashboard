import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data'
import { customers, invoices } from '@/app/lib/placeholder-data'
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs'
import Form from '@/app/ui/invoices/edit-form'
import React from 'react'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [invoice, customers] = await Promise.all([fetchInvoiceById(id), fetchCustomers()])
  console.log('invoice', invoice);
  
  return (
    <main>
      <Breadcrumbs breadcrumbs={[
        { label: 'Invoices', href: '/dashboard/invoices' },
        {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]} 
      />
      <Form invoice = {invoice} customers={customers} />
  </main>
  )
}
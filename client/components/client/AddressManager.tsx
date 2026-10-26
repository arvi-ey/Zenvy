'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createAddress, deleteAddress, getAddresses, type Address, type AddressType } from '@/api/address'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AddressManagerProps {
  mode: 'page' | 'picker'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  selectedAddressId?: number | null
  onSelect?: (address: Address) => void
}

const typeLabels: Record<AddressType, string> = {
  home: 'Home',
  office: 'Office',
  others: 'Other',
}

const emptyForm = {
  street: '',
  landmark: '',
  pincode: '',
  state: '',
  district: '',
  type: 'home' as AddressType,
}

function getErrorMessage(error: unknown, fallback: string) {
  return axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message ?? fallback
    : error instanceof Error ? error.message : fallback
}

function AddressSkeleton() {
  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-64 max-w-full" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  )
}

export function AddressManager({
  mode,
  open = false,
  onOpenChange,
  selectedAddressId = null,
  onSelect,
}: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const loadAddresses = useCallback(async () => {
    setIsLoading(true)
    try {
      setAddresses(await getAddresses())
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Unable to load your addresses.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mode === 'page' || open) void loadAddresses()
  }, [loadAddresses, mode, open])

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      const address = await createAddress({
        ...form,
        landmark: form.landmark.trim() || undefined,
      })
      setAddresses((current) => [address, ...current])
      setForm(emptyForm)
      setIsFormOpen(false)
      toast.success('Address saved.')
      if (mode === 'picker') {
        onSelect?.(address)
        onOpenChange?.(false)
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Unable to save your address.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (addressId: number) => {
    setDeletingId(addressId)
    try {
      await deleteAddress(addressId)
      setAddresses((current) => current.filter((address) => address.id !== addressId))
      toast.success('Address removed.')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Unable to remove this address.'))
    } finally {
      setDeletingId(null)
    }
  }

  const formContent = (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`street-${mode}`}>Street address</Label>
        <Input id={`street-${mode}`} autoComplete="street-address" value={form.street} onChange={(event) => setForm({ ...form, street: event.target.value })} minLength={3} maxLength={500} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`landmark-${mode}`}>Landmark (optional)</Label>
        <Input id={`landmark-${mode}`} value={form.landmark} onChange={(event) => setForm({ ...form, landmark: event.target.value })} maxLength={200} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`district-${mode}`}>City / district</Label>
          <Input id={`district-${mode}`} autoComplete="address-level2" value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })} minLength={2} maxLength={100} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`state-${mode}`}>State</Label>
          <Input id={`state-${mode}`} autoComplete="address-level1" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} minLength={2} maxLength={110} required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`pincode-${mode}`}>Postal code</Label>
          <Input id={`pincode-${mode}`} autoComplete="postal-code" value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value })} minLength={3} maxLength={20} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`type-${mode}`}>Address type</Label>
          <Select value={form.type} onValueChange={(value) => {
            if (value === 'home' || value === 'office' || value === 'others') {
              setForm({ ...form, type: value })
            }
          }}>
            <SelectTrigger id={`type-${mode}`} className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="others">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        {mode === 'page' && <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>}
        <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save address'}</Button>
      </div>
    </form>
  )

  const addressList = isLoading ? (
    <div className="grid gap-4 sm:grid-cols-2">
      <AddressSkeleton />
      <AddressSkeleton />
    </div>
  ) : addresses.length > 0 ? (
    <div className="grid gap-4 sm:grid-cols-2">
      {addresses.map((address) => (
        <article
          key={address.id}
          className={`rounded-xl border p-5 transition-colors ${selectedAddressId === address.id ? 'border-primary bg-primary/5' : 'border-border'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                {typeLabels[address.type]}
                {selectedAddressId === address.id && <span className="text-xs text-primary">Selected</span>}
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {address.street}
                {address.landmark && <> · {address.landmark}</>}
                <br />
                {address.district}, {address.state} {address.pincode}
              </p>
            </div>
            {mode === 'page' && (
              <Button type="button" size="icon" variant="ghost" aria-label={`Delete ${typeLabels[address.type]} address`} disabled={deletingId === address.id} onClick={() => void handleDelete(address.id)}>
                {deletingId === address.id ? <Skeleton className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
          {mode === 'picker' && (
            <Button type="button" className="mt-4 w-full" variant={selectedAddressId === address.id ? 'default' : 'outline'} onClick={() => { onSelect?.(address); onOpenChange?.(false) }}>
              {selectedAddressId === address.id ? 'Selected' : 'Deliver to this address'}
            </Button>
          )}
        </article>
      ))}
    </div>
  ) : (
    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
      <h3 className="mt-3 font-medium">No addresses saved</h3>
      <p className="mt-1 text-sm text-muted-foreground">Add an address to make checkout quicker.</p>
    </div>
  )

  if (mode === 'picker') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose a delivery address</DialogTitle>
            <DialogDescription>Select a saved address or add a new one.</DialogDescription>
          </DialogHeader>
          {addressList}
          {isFormOpen ? (
            <div className="rounded-xl border border-border p-4">{formContent}</div>
          ) : (
            <Button type="button" variant="outline" className="w-full" onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add a new address
            </Button>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Your addresses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the addresses you use for delivery.</p>
        </div>
        <Button type="button" onClick={() => setIsFormOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add address</Button>
      </div>
      {isFormOpen && <div className="rounded-xl border border-border bg-card p-5">{formContent}</div>}
      {addressList}
    </section>
  )
}

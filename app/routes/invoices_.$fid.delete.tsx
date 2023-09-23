import { useNavigate } from '@remix-run/react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

export default function InvoiceFidDelete() {
  const navigate = useNavigate()
  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          navigate(-1)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure absolutely sure?</DialogTitle>
          <DialogDescription>It'll delete</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

'use client';

import React, { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import { deleteStore } from '@/lib/tracker-actions';

interface DeleteStoreButtonProps {
  storeId: string;
}

export default function DeleteStoreButton({ storeId }: DeleteStoreButtonProps) {
  // Bind the storeId to the action. 
  // Resulting signature for useActionState is (prevState, formData) => Promise
  const deleteAction = deleteStore.bind(null, storeId);
  const [state, dispatch, isPending] = useActionState(deleteAction, null);

  return (
    <form action={dispatch}>
        <Button 
            type="submit" 
            variant="outline" 
            size="sm" 
            className="text-red-400 hover:text-red-300 border-red-900/50 hover:bg-red-900/20"
            disabled={isPending}
        >
            <Trash2 size={16} />
        </Button>
        {state?.error && <span className="text-red-500 text-xs ml-2">Error</span>}
    </form>
  );
}

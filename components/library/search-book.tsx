"use client"

import { useActionState } from "react"
import { fetchMetadataAction } from "@/app/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchBook({}: {}) {

    const initialState = {
        book: {},
        isbn: ''
    }

    const [state, formAction] = useActionState(fetchMetadataAction, initialState)
    return (
        <div className="flex flex-col">
        <form action={formAction} className="flex flex-col items-end space-y-5">
            <Input type="text" name="isbn" id="isbn" placeholder="ISBN number"/>
            <Button type="submit" className="max-w-24">Search Book</Button>
        </form>
        <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Book details</h2>
        
        <img src={state?.book.image} />

        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(state?.book, null, 2)}
        </pre>
      </div>
        </div>
    )
}
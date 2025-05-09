"use client"

import { useActionState } from "react"
import { fetchMetadataAction } from "@/app/actions"

export function SearchBook({}: {}) {

    const initialState = {
        book: {},
        isbn: ''
    }

    const [state, formAction] = useActionState(fetchMetadataAction, initialState)
    return (
        <div>
        <form action={formAction}>
            <input type="text" name="isbn"/>
            <button type="submit">Search Book</button>
        </form>
        <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(state?.book, null, 2)}
        </pre>
      </div>
        </div>
    )
}
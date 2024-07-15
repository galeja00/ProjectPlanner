"use client"

import { ButtonWithText } from "./other"
import { createContext, useState } from "react"

// komponent for simple Error handling by displaying message to user with button to try again

// for state of components witch is using tyhs Error boundery
export type ErrorState = {
    error : unknown,
    repeatFunc : () => void
}

type ErrorInfo = {
    msg : string,
    repeatFunc : () => void
}

interface ErrorContextType {
    submitError : (error : unknown, repeatFunc : () => void) => void
}

export const ErrroContext = createContext<ErrorContextType | null>(null);

// extract from error messaage or change to default value
function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error === 'string') {
        return error;
    } else {
        return 'An unknown error occurred' ;
    }
}

export function ErrorBoundary({ children, error }: { children: React.ReactNode, error : ErrorState | null }) {
    //const [error, setError] = useState<ErrorState | null>(null);

    if (!error) {
        return <>{children}</>;
    }
    const extractedError = extractErrorMessage(error.error);
    const errorInfo: ErrorInfo = { msg: extractedError, repeatFunc: error.repeatFunc };

    return (
        <>
            {children}
            <ErrorPopUp error={errorInfo} />
        </>
    );
}

function ErrorPopUp({ error }: { error: ErrorInfo }) {
    return (
        <div className="fixed bottom-0 right-0 mb-4 mr-4 bg-red-600 bg-opacity-40 border border-red-600 text-red-600 p-4 rounded  space-y-4">
            <p>{error.msg}</p>
            <div className="w-full flex justify-end">
                <ButtonWithText text="Try again" handle={error.repeatFunc} type="primary" />
            </div>
            
        </div>
    );
}


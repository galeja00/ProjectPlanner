"use client"

import { createContext, useContext, useState } from "react"
import { ButtonWithText } from "./buttons"

// komponent for simple Error handling by displaying message to user with button to try again

// for state of components witch is using this Error boundary
export type ErrorState = {
    error : unknown,
    repeatFunc : () => void
}

type ErrorInfo = {
    msg : string,
    repeatFunc : () => void
}

interface ErrorContextType {
    submitError : (error : unknown, calbackFunc : () => void) => void
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export function useError() {
    const context = useContext(ErrorContext);
    if (context === null) {
        throw new Error("useError must be used within an ErrorBoundary");
    }
    return context;
}

// extract from error message or change to default value
function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error === 'string') {
        return error;
    } else {
        return 'An unknown error occurred' ;
    }
}

export function ErrorBoundary({ children }: { children: React.ReactNode}) {
    const [error, setError] = useState<ErrorInfo | null>(null);

    function submitError(error : unknown, calbackFunc : () => void) {
        setError({ msg: extractErrorMessage(error), repeatFunc: calbackFunc });
    }

    function closeError() {
        setError(null);
    }

    return (
        <ErrorContext.Provider value={{ submitError }}>
            {children}
            {error && <ErrorPopUp error={error} closeError={closeError} />}
        </ErrorContext.Provider>
    );
}

function ErrorPopUp({ error, closeError }: { error: ErrorInfo, closeError : () => void }) {
    return (
        <div className="fixed bottom-0 right-0 mb-4 mr-4 bg-red-600 bg-opacity-40 border border-red-600 text-red-600 p-4 rounded  space-y-4">
            <button className=" absolute top-0 right-0 m-2" onClick={closeError}><img src={'/x.svg'} alt={'close'} className="w-5 h-5"></img></button>
            <p>{error.msg}</p>
            <div className="w-full flex justify-end">
                <ButtonWithText text="Try again" handle={error.repeatFunc} type="primary" />
            </div>
        </div>
    );
}

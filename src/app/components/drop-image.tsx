import { useReducer, useState, DragEvent, useRef, ChangeEvent } from "react"
import { DialogClose } from "./other";

// TODO: add some arg for better use
export default function DropImage({ closeDrop, updateImg } : { closeDrop : () => void, updateImg : (file : File) => void }) {
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isOver, toggleOver] = useReducer(isOver => !isOver ,false);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleDragOver(e : DragEvent) {
        e.preventDefault();
        if (!isOver) {
            toggleOver();
        }
        
    }

    function submitFile(file : File) {
        if (file.type == "image/png" || file.type == "image/jpeg") {
            updateImg(file);
        } 
        else {
            setErrorMsg("Unsupported file format");
        }
    }

    function handleDrop(e : DragEvent) {
        e.preventDefault();
        submitFile(e.dataTransfer.files[0]);
        
    }

    function handleDragExit(e : DragEvent) {
        e.preventDefault();
        if (isOver) {
            toggleOver();
        }
    }

    function handleSelect(e : ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        if (e.target.files) {
            submitFile(e.target.files[0]);
        }
    }

    return (
        <div className="w-full h-full bg-neutral-900 bg-opacity-60 absolute z-50 flex justify-center items-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragExit}
            onDrop={handleDrop}
        >
            <div className={` w-64 h-64 ${isOver ? "bg-violet-600" : "bg-neutral-950"} rounded flex justify-center items-center p-2`}>
                <div className="w-full h-full border border-dashed rounded flex flex-col justify-center items-center relative">
                    <DialogClose handleClose={closeDrop}/>
                    <div>Drop Image <div>Or</div></div>
                    <input type="file" title="" accept="image/png, image/jpeg" hidden ref={inputRef}
                        onChange={handleSelect}
                    />
                    <button onClick={() => inputRef.current?.click()} className="btn-primary">Select Image</button>
                    <p className="text-red-500">{errorMsg}</p>
                </div>
            </div>
        </div>
    )
}
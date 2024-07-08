"use client"


import { useEffect, useReducer, useState, KeyboardEvent, ChangeEvent } from "react";
import Image from 'next/image' 
import { ArrayButtons, Button, ButtonType, Lighteness } from "@/app/components/buttons";


export function Name({name, updateName} : {name : string, updateName : (name : string) => void}) {
    const [eName, setName] = useState<string>(name);
    const [isEditing, toggleEdit] = useReducer((isEditing) => !isEditing, false);

    function submitName(val : string) {
        setName(val);
        updateName(val);
    }

    function changeEdit() {
        toggleEdit();
    }
    
    function handleKeyDown(event : KeyboardEvent<HTMLInputElement>) {
        //event.preventDefault();
        const inputValue = event.currentTarget.value;
        if (event.key === 'Enter') {
            if (inputValue.length > 0) {
                submitName(inputValue);
                toggleEdit();
            }
        }
    }
    /*
    const buttons : Button[] = [
        { onClick: () submitName, img: "/check.svg", type: ButtonType.Creative, size: 6, lightness: Lighteness.bright, title: "Create"},
        { onClick: endCreate, img: "/x.svg", type: ButtonType.Destructive, size: 6, lightness: Lighteness.bright, title: "End"}
    ]*/
    return (
        <div className="flex mb-4 gap-4">
            {
                isEditing ? 
                    <>
                        <input type="text" defaultValue={eName} onKeyDown={handleKeyDown} className="bg-neutral-950 outline-none border-b text-xl font-bold w-5/6"></input>
                    </>
                    :
                    <>
                        <h3 className='text-xl font-bold'>{eName}</h3>
                    </>
            }
            <button onClick={changeEdit} title="Edit Name">
                <Image src={"/pencil.svg"} alt={"custom name"} height={20} width={20}/>
            </button>
        </div>
    )
}

export enum InputTypes {
    Text = "text",
    Color = "color",
    Date = "date"
}


export function Editor({ val = "", create, endCreate, type } : { val? : string, create: (text : string) => void, endCreate : () => void, type : InputTypes }) {
    const [ value, setValue ] = useState<string>(val);
    
    function handleKeyDown(event :  KeyboardEvent<HTMLInputElement>) {
        if (type == InputTypes.Text || type == InputTypes.Date) {
            const inputValue = event.currentTarget.value;
            if (event.key === 'Enter') {
                if (inputValue.length > 0) {
                    create(inputValue);
                }
            } else if (event.key === 'Escape') {
                endCreate();
            }
        }
    }

    function handleChange(event : ChangeEvent<HTMLInputElement>) {
        setValue(event.currentTarget.value);
    }

    function handleCreate() {
        create(value);
        endCreate();
    }

    const buttons : Button[] = [
        { onClick: handleCreate, img: "/check.svg", type: ButtonType.Creative, size: 6, lightness: Lighteness.Bright, title: "Create"},
        { onClick: endCreate, img: "/x.svg", type: ButtonType.Destructive, size: 6, lightness: Lighteness.Bright, title: "End"}
    ]

    return (
        <div className="rounded flex gap-2 ">
            <input type={type} className=" bg-neutral-950 outline-none border-b w-full" id="name" onKeyDown={handleKeyDown} onChange={handleChange} value={value}></input>
            <ArrayButtons buttons={buttons} gap={2}/>
        </div>
    )
}

export function Selector({ val, options, select, endSelect } : { val : string ,options : string[], select : (val : string) => void, endSelect : () => void}) {
    const [ value, setValue ] = useState<string>(val == "" ? options[0] : val);

    function handleSelect(event: ChangeEvent<HTMLSelectElement>) {
        setValue(event.target.value);
    };

    function handleSubmit() {
        select(value);
        endSelect();
    }

    const buttons : Button[] = [
        { onClick: handleSubmit, img: "/check.svg", type: ButtonType.Creative, size: 6, lightness: Lighteness.Bright, title: "Create"},
        { onClick: endSelect, img: "/x.svg", type: ButtonType.Destructive, size: 6, lightness: Lighteness.Bright, title: "End"}
    ]

    return (
        <div className="rounded flex gap-2 ">
            <select className=" bg-neutral-950 outline-none border-b w-full" onChange={handleSelect}>
            {
                options.map((o) =>(
                    <option value={o}>{o}</option>
                ))
            }
            </select>
            <ArrayButtons buttons={buttons} gap={2}/>
        </div>
        
    )
}
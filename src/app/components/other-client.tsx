"use client"
import { LoadingOval } from "@/app/components/other"
import { useEffect, useRef, useState } from "react";
import Image from 'next/image' 


export function InitialLoader() {
    return ( 
        <div className=' w-full h-full flex justify-center items-center'>
            <LoadingOval/>
        </div>
    )
}

/* A globally improved, all-around component for pop-up menus, currently not implemented.
export type ButtonImage = {
    src: string,
    size: number,

}

function PopUpMenu({ image, title, items } : { image : string, title : string, items : JSX.Element[] }) {
    const [ isMenu, setMenu ] = useState<boolean>(false); 
    const menuRef = useRef<HTMLUListElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
  
    function isClickedOutside(event: MouseEvent) {
        const target = event.target as Node;
        if (menuRef.current && buttonRef.current) {
            return !menuRef.current.contains(target) && !buttonRef.current.contains(target);
        }
      };
    
    function handleClickOutside(event: MouseEvent) {
        event.stopPropagation();
        if (isClickedOutside(event)) {
            setMenu(false);
        }
    }
  
    function handleClickButton(event: React.MouseEvent) {
        event.stopPropagation();
        setMenu(isMenu => !isMenu); 
    }
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
      } ;
    }, [isMenu]);

    
    return (
        <>
            <button ref={buttonRef} onClick={handleClickButton}>
                <Image src={image} alt={title} width={20} height={20} className='w-5 h-5 rounded-full cursor-pointer'/>
            </button>
            { isMenu && 
                <ul ref={menuRef}>
                    {
                        items.map((item, index) => (
                            <li>{item}</li>
                        ))
                    }
                </ul>
            }
        </>
    )
}


function MoreMenu({ items }: { items: MoreMenuItem[] }) {
    const [isMenu, setMenu] = useState<boolean>(false);
    const menuRef = useRef<HTMLUListElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
  
    const isClickedOutside = (event: MouseEvent) => {
        if (menuRef.current && buttonRef.current) {
            return !menuRef.current.contains(event.target as Node) && !buttonRef.current.contains(event.target as Node);
        }
        return false;
      };
    
      function handleClickOutside(event: MouseEvent) {
        event.stopPropagation();
        if (isClickedOutside(event)) {
            setMenu(false);
        }
      }
  
    function handleClickButton(event: React.MouseEvent) {
        event.stopPropagation();
        setMenu(isMenu => !isMenu); 
    }
  
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
      } ;
    }, [isMenu]);
  
    return (
        <>
            <button ref={buttonRef} onClick={handleClickButton} className='h-fit rounded hover:bg-neutral-200 p-1'>
                <Image src="/more.svg" alt="more" width={20} height={20} className='w-5 h-5 rounded-full cursor-pointer' />
            </button>
            {isMenu && (
                <ul ref={menuRef} className='absolute w-28 bg-neutral-200 rounded p-2 right-0 top-10 z-20 shadow shadow-neutral-100 space-y-1'>
                    {items.map((item) => (
                        <MoreMenuItems key={item.name} item={item} />
                    ))}
          </ul>
        )}
      </>
    );
}
*/
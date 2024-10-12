import React from 'react'
import { PiUserCircle } from 'react-icons/pi'
import { useSelector } from 'react-redux'

const Avatar = ({ userId, name, imageUrl, width, height }) => {
    const onlineUser = useSelector(state => state?.user?.onlineUser)

    let avatarName = ""
    if(name){
        const splitName = name?.split(" ")

        if(splitName.length > 1){
            avatarName = splitName[0][0]+splitName[1][0]
        }else{
            avatarName = splitName[0][0]
        }
    }

    const bgColor = [
        'bg-slate-200',
        'bg-teal-200',
        'bg-red-200',
        'bg-green-200',
        'bg-yellow-200',
        'bg-gray-200',
        'bg-cyan-200',
        'bg-sky-200',
        'bg-blue-200'
    ]

    const randomNumber = Math.floor(Math.random() * 9)

    const isOnline = onlineUser.includes(userId)
    return (

        <>
        <div className='relative'>
            <div className={`text-slate-800 overflow-hidden rounded-full font-bold `}style={{width : width+"px",height : height+"px"}}>
                {
                imageUrl ? (
        
                        <img src={imageUrl} alt={name}
                        width={width}
                        height={height}
                        className=' overflow-hidden rounded-full' />
            
                ) : (
                    name ? (
                        <div className={`overflow-hidden rounded-full flex justify-center items-center text-lg ${bgColor[randomNumber]}`} style={{width : width+"px",height : height+"px"}}>
                            {avatarName}
                        </div>
                    ) : (
                        <PiUserCircle
                        size={width}
                    />
            )
                )
            }
               
          
        
            </div>
            {
                isOnline && (
                    <div className='bg-green-600 p-1 absolute bottom-1.5 right-0 z-10 rounded-full'></div>
                )
            }
            </div>
        </>
    )
}

export default Avatar
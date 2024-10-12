import React, { useEffect, useState } from 'react'
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CiLogout } from "react-icons/ci";
import Avatar from "./Avatar"
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetails';
import { FiArrowUpLeft } from "react-icons/fi";
import SeachUser from './SeachUser';
import { FaVideo } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { logout } from '../redux/userSlice';

const SideBar = () => {
    const user = useSelector(state => state?.user)
    const [editUserOpen,setEditUserOpen] = useState(false)
    const [allUser,setAllUser] = useState([])
    const [openSearchUser,setOpenSearchUser] = useState(false)
    const socketConnection = useSelector(state => state?.user?.socketConnection)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(()=>{
        if(socketConnection){
            socketConnection.emit('sidebar',user._id)

            socketConnection.on('conversation',(data)=>{
                const conversationUserData = data.map((conversationUser,index)=>{
                    if(conversationUser?.sender?._id === conversationUser?.receiver?._id){
                        return{
                            ...conversationUser,
                            userDetails : conversationUser?.sender
                        }
                    }
                    else if(conversationUser?.receiver?._id !== user?._id){
                        return{
                            ...conversationUser,
                            userDetails : conversationUser.receiver
                        }
                    }else{
                        return{
                            ...conversationUser,
                            userDetails : conversationUser.sender
                        }
                    }
                }) 
                setAllUser(conversationUserData)
            })
        }
    },[socketConnection,user])

    const handleLogout = () => {
        dispatch(logout())
        navigate("/email")
        localStorage.clear()
    }

  return (
    <div className='w-full h-full grid grid-cols-[48px,1fr] bg-white'>

    <div className="bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600 flex flex-col justify-between">
        <div>   
        <NavLink className={({isActive})=>`w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${isActive && "bg-slate-200"}`}  title='Chat'>
    <IoChatbubbleEllipses
    size={20}
    />
    </NavLink>
    <div  className={'w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded'} title='Add friend' onClick={()=>setOpenSearchUser(true)}>
        <FaUserPlus size={20}/>
    </div>
        </div>

        <div className='flex flex-col items-center'>
            <button className='mx-auto' title={user?.name} onClick={()=> setEditUserOpen(true)}>
                <Avatar
                width={40}
                height={40}
                name={user?.name}
                imageUrl={user?.profile_pic}
                userId={user?._id}
                />
            </button>
            <button className={'w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded'} title='Logout' onClick={handleLogout} >
                <span className='-ml-2'>
                <CiLogout size={20}/>
                </span>
            </button>
        </div>
    </div>

    <div className='w-full'>
        <div className='h-14 flex items-center'>
        <h2 className='text-xl font-bold p-4 text-slate-800 h-15'>Message</h2>
        </div>
        <div className="bg-slate-200 p-[0.5px]"></div>

        <div className=' h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar'> 
            {
                allUser.length === 0 && (
                    <div className='mt-12'>
                        <div className='flex justify-center items-center my-2 text-slate-500'>
                    <FiArrowUpLeft 
                    size={50}/>
                        </div>
                        <p className='text-lg text-center text-slate-400'>Explore users to start a conversation with.</p>
                    </div>
                )
            }

            {
                allUser.map((conv,index)=>{
                    return(
                        <NavLink to={"/"+conv?.userDetails?._id} key={conv?._id} className='flex items-center gap-2 py-3 px-2 border border-transparent hover:border-primary rounded hover:bg-slate-100 cursor-pointer'>
                            <div>
                                <Avatar 
                                imageUrl={conv?.userDetails?.profile_pic}
                                name={conv?.userDetails?.name}
                                width={40}
                                height={40}
                                />
                            </div>
                            <div>
                                <h3 className='text-ellipsis line-clamp-1 font-semibold text-base'>{conv?.userDetails?.name}</h3>
                        <div className='text-slate-500 text-xs flex items-center gap-1' >
                            <div>
                                {
                                    conv?.lastMsg?.imageUrl && (
                                     <div className='flex items-center gap-1'>
                                           <span ><FaImage /></span>
                                           {!conv?.lastMsg?.text && <span>Image</span> }  
                                     </div>
                                    )
                                }
                                {
                                    conv?.lastMsg?.videoUrl && (
                                     <div className='flex items-center gap-1'>
                                           <span ><FaVideo /></span>
                                           {!conv?.lastMsg?.text && <span>Video</span> }  
                                     </div>
                                    )
                                }
                            </div>
                            <p className='text-ellipsis
                             line-clamp-1'>{conv?.lastMsg?.text}</p>
                        </div>
                            </div>
{
    Boolean(conv?.unseenMsg) && (
        <p className='text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-primary text-white font-semibold rounded-full'>{conv?.unseenMsg}</p>
    )
}
                       
                        </NavLink>
                    )
                })
            }
        </div>
    </div>

    {/* (EditUserDetails) */}

    {
        editUserOpen && (
            <EditUserDetails onClose={()=>setEditUserOpen(false)} user={user} />
        )
    }


    {/* Search User  */}
{
    openSearchUser && (
        <SeachUser onClose={()=>setOpenSearchUser(false)}/>
    )
}
        
    </div>
  )
}

export default SideBar
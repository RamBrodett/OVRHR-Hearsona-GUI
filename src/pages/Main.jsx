import { useState, useEffect} from 'react'
import {AudioLines} from 'lucide-react'

function MainApplication(){
  return (
    <div className='flex flex-col bg-[var(--background)] p-7 gap-5 h-screen min-w-screen'>
      <div className='flex flex-row h-1/20 gap-5 items-center'>
        <AudioLines className='w-8 h-8 text-[var(--foreground)]'/>
        <p className='text-2xl font-bold text-[var(--foreground)]'>OVR HEAR</p>
      </div>
      <div className='flex flex-row h-19/20 gap-20 items-center pb-10'>
        <div className='bg-[var(--background-2)] h-5/5 w-3/7 rounded-3xl'>
        {/** AI PROMPTING PANEL */}
        </div>
        <div>{/* TONAL SHAPING PANEL */}</div>
      </div>
    </div>
  )
}

export default MainApplication

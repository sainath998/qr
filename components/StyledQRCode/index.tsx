'use client'
import dynamic from 'next/dynamic'

const A = dynamic(() => import('./A'), {
  ssr: false
})

export default A
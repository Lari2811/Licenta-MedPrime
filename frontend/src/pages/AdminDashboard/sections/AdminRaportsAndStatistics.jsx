import React from 'react'
import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess'

const AdminRaportsAndStatistics = () => {

   useCheckAdminAccess();
   
  return (
    <div>AdminRaportsAndStatistics</div>
  )
}

export default AdminRaportsAndStatistics
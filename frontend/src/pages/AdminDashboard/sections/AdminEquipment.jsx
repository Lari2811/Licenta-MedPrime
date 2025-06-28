import React from 'react'
import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess';


const AdminEquipment = () => {

   useCheckAdminAccess();
   
  return (
    <div>AdminEquipment</div>
  )
}

export default AdminEquipment
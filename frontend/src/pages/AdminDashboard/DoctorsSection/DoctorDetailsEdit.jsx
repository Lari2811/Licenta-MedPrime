import React from 'react'
import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess';

const DoctorDetailsEdit = () => {
    useCheckAdminAccess();

  return (
    <div>DoctorDetailsEdit</div>
  )
}

export default DoctorDetailsEdit
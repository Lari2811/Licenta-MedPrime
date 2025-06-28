import React from 'react'
import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess';

const LocationDetailsEdit = () => {

   useCheckAdminAccess();
  return (
    <div>LocationDetailsEdit</div>
  )
}

export default LocationDetailsEdit
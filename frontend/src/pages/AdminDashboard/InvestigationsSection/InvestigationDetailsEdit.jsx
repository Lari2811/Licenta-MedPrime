import React from 'react'
import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess';

const InvestigationDetailsEdit = () => {
  
    useCheckAdminAccess();
    return (
    <div>InvestigationDetailsEdit</div>
  )
}

export default InvestigationDetailsEdit
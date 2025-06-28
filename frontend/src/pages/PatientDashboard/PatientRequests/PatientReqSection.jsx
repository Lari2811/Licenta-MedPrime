import React from 'react'
import { useCheckPatientAccess } from '../../../accessControl/useCheckPatientAccess';

const PatientReqSection = () => {

    useCheckPatientAccess();

  return (
    <div>PatientReqSection</div>
  )
}

export default PatientReqSection
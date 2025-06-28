
import locationModel from '../../../models/locationModel.js';

export const getUniqueCounties = async (req, res) => {
  try {
    const counties = await locationModel.distinct('address.county');

    res.status(200).json({
      success: true,
      message: 'Județele au fost extrase cu succes.',
      counties: counties
    });
  } catch (err) {
    console.error('Eroare la extragerea județelor:', err);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea județelor.',
      error: err.message
    });
  }
};

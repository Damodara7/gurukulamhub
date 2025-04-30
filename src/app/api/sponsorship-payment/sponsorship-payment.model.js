import mongoose from 'mongoose'

const sponsorshipPaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true
  },
  sponsorshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sponsorship',
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
})

const SponsorshipPayment = mongoose.models.sponsorshipPayment || mongoose.model('sponsorshipPayment', sponsorshipPaymentSchema)

export default SponsorshipPayment

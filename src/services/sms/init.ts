import { EnvironmentVars } from '../../constants'
import init from 'twilio'
import logger from '../..//utils/logger'

const client = init(EnvironmentVars.getTwilioAccountSID(), EnvironmentVars.getTwilioAuthToken())
export default client.messages
	.create({
		body: 'Hello from VIGILANT OCTOPUS',
		to: EnvironmentVars.getTO_SMS_Phone(),
		from: EnvironmentVars.getFromSMSPhone(),
	})
	.then(message => logger.info(message.sid))

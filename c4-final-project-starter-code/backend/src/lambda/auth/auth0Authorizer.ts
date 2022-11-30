import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJHtq85cala3zMMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi16YzBheXN6NGE0cHltbGV0LnVzLmF1dGgwLmNvbTAeFw0yMjExMjkx
MjMyMjJaFw0zNjA4MDcxMjMyMjJaMCwxKjAoBgNVBAMTIWRldi16YzBheXN6NGE0
cHltbGV0LnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAKfLweICOq9gtbVGZhI+r8Ft99sLXqdyj77ELjXr5IVB1qHJv9vS9TZaw1Oo
1+YaE2xx8zDwSqleTj9pXCntILKRGZxik4iLFnnifs8nMFsT+FJV/amG573xN5Ev
Xs1wndKqT8E+Ru9nA38k16juFD9c9YxUQc4+Rwh7qrQdDMPhtmlBQcJ/JMsJEiNv
VLzT548rDBomdM00bvQKf7OfeBSAXwCEdR6worVf1tAwIa1WMs8g+CjQxEImgY0v
/IjBOX+xsCf8zZo/zaDpLWMzxoE7OD1/THx+9FX+0rvfvN2rpBsMbH+708AwEgpx
OFDBZNBsFM+q1feQYpYwTmSg348CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUr0k7dEcBcSm4MyKyylvnNvWI/6kwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQA2fPdehA5mNshP+wFcrFeo13myVjbiaqTojv+43j/N
+1lURGXGvJWLA6MuFsVKfb/s4QoLMqxjXaw7LXS5CxCj5gNIJExS4EA9tx4IKnP2
mKAyusitJZ+IuJtkjzI9xz2ReH32ju0sYOWtxI3WNTGDM4g0KphZo2lYz0bm9JtN
0Txpa37gGeHghGz1pWi4oXepd21YM/XmowwbOMljoA/95ZMCg0oYDKJWJJPXmzeJ
RwlHwnGBnnZwHQ/ZyfqTKyf3pwG6GswebfOjp0290HM+O01DO3TpvCpqJ+z0MHFR
bvi5KdSXRPgQ4rC8N5rr5fiFCzp+cSnMigWKHPprzgKr
-----END CERTIFICATE-----`
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

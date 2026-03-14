/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your Golden Hour AI password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your password for Golden Hour AI.
          Click the button below to choose a new one.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Reset Password →
        </Button>
        <Text style={footer}>
          If you didn't request this, you can safely ignore this email.
          Your password will not be changed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#060b18', fontFamily: "'Inter', Arial, sans-serif" }
const container = {
  padding: '40px 30px',
  backgroundColor: '#111f3d',
  borderRadius: '8px',
  border: '1px solid #1a2d52',
  maxWidth: '480px',
  margin: '40px auto',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#d4940a',
  margin: '0 0 20px',
  fontFamily: "'Cinzel', Georgia, serif",
}
const text = {
  fontSize: '14px',
  color: '#e8dcc8',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const button = {
  backgroundColor: '#d4940a',
  color: '#060b18',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  borderRadius: '8px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#7a8ba8', margin: '30px 0 0' }

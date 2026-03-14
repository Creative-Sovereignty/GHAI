/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for Golden Hour AI</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm email change</Heading>
        <Text style={text}>
          You requested to change your Golden Hour AI email from{' '}
          <Link href={`mailto:${email}`} style={link}>{email}</Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm Email Change →
        </Button>
        <Text style={footer}>
          If you didn't request this change, please secure your account immediately.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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
const link = { color: '#ffd666', textDecoration: 'underline' }
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

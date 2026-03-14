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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to Golden Hour AI</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're invited ✨</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>Golden Hour AI</strong>
          </Link>
          . Click below to accept and create your account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation →
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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

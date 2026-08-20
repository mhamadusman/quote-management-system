import { Box, Container, Typography, Grid } from '@mui/material';
import type { FooterProps } from '../../types';
import { BRANDING, FOOTER_COLUMNS } from '../../constants';
import '../../styles/footer/footer.css';

export const Footer = (props: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const title = props.appName || BRANDING.APP_TITLE;

  return (
    <Box component="footer" className="footer-container">
      {/* Top-Right Decorative Enhanced Half Circle */}
      <div className="footer-circle-ring" />

      {/* Big Faded Watermark Background */}
      <div className="footer-watermark">{BRANDING.NAME}</div>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {/* Brand Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography
                component="span"
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  letterSpacing: '-0.03em',
                  color: '#0F172A',
                  display: 'inline-flex',
                  alignItems: 'baseline',
                }}
              >
                {BRANDING.NAME}
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    ml: '1.5px',
                    mb: '1px',
                  }}
                />
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, lineHeight: 1.6 }}>
              {title}. {BRANDING.APP_DESCRIPTION}
            </Typography>
          </Grid>

          {/* Links Columns */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
              {FOOTER_COLUMNS.map((col) => (
                <Grid key={col.title} size={{ xs: 6, sm: 4 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#0F172A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      display: 'block',
                      mb: 1.5,
                    }}
                  >
                    {col.title}
                  </Typography>
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {col.links.map((link) => (
                      <Box component="li" key={link} sx={{ mb: 1 }}>
                        <span className="footer-link">{link}</span>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            pt: 3,
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © {currentYear} {BRANDING.COPYRIGHT}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {BRANDING.STATUS_SECURE}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

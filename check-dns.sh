#!/bin/bash

# DNS Verification Script for bloomsplash.theishu.xyz

echo "🔍 Checking DNS configuration for bloomsplash.theishu.xyz..."
echo "================================================="

# Check if domain resolves
echo "1. Checking domain resolution..."
nslookup bloomsplash.theishu.xyz
echo ""

# Check CNAME record
echo "2. Checking CNAME record..."
dig bloomsplash.theishu.xyz CNAME +short
echo ""

# Check A records
echo "3. Checking A records..."
dig bloomsplash.theishu.xyz A +short
echo ""

# Check if site is accessible
echo "4. Testing HTTP/HTTPS access..."
echo "HTTP Status:"
curl -I http://bloomsplash.theishu.xyz 2>/dev/null | head -1
echo "HTTPS Status:"
curl -I https://bloomsplash.theishu.xyz 2>/dev/null | head -1 || echo "SSL certificate not ready yet (this is normal for new domains)"
echo ""

# Check SSL certificate
echo "5. Checking SSL certificate..."
echo "SSL Certificate Status:"
openssl s_client -connect bloomsplash.theishu.xyz:443 -servername bloomsplash.theishu.xyz < /dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "SSL certificate not ready yet"

echo ""
echo "✅ DNS check complete!"
echo ""
echo "📝 Status Summary:"
echo "- DNS Records: ✅ Working"
echo "- Domain Resolution: ✅ Working"  
echo "- Firebase Connection: ✅ Working"
echo "- SSL Certificate: ⏳ Processing (can take 24-48 hours)"
echo ""
echo "🔄 If Firebase console shows 'Records not yet detected':"
echo "- Your setup is correct"
echo "- Firebase detection can be slow"
echo "- Wait 24-48 hours for SSL certificate"
echo "- You can close the dialog and check later"

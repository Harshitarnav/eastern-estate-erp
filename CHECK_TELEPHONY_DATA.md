# Quick Check - Is Telephony Data in Database?

Run these commands to verify:

```bash
# Check if calls exist
psql -U arnav -d eastern_estate_erp -c "SELECT COUNT(*) FROM telephony.call_logs;"

# Check if insights exist
psql -U arnav -d eastern_estate_erp -c "SELECT COUNT(*) FROM telephony.ai_insights;"

# Check hot leads
psql -U arnav -d eastern_estate_erp -c "SELECT COUNT(*) FROM telephony.ai_insights WHERE hot_lead = true;"

# Check a sample call
psql -U arnav -d eastern_estate_erp -c "SELECT call_sid, direction, status, duration FROM telephony.call_logs LIMIT 3;"
```

If these return 0, the data wasn't loaded.
If these return data, then the backend queries need fixing.


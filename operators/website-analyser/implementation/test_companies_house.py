import unittest

from analyser.companies_house import _extract_ixbrl, _fact_number


SAMPLE_IXBRL = b"""<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:ix="http://www.xbrl.org/2013/inlineXBRL"
      xmlns:xbrli="http://www.xbrl.org/2003/instance">
  <body>
    <ix:header>
      <xbrli:context id="current"><xbrli:period><xbrli:instant>2026-04-30</xbrli:instant></xbrli:period></xbrli:context>
      <xbrli:context id="previous"><xbrli:period><xbrli:instant>2025-04-30</xbrli:instant></xbrli:period></xbrli:context>
    </ix:header>
    <ix:nonFraction name="core:NetAssetsLiabilities" contextRef="current" unitRef="GBP" scale="0">7,903</ix:nonFraction>
    <ix:nonFraction name="core:NetAssetsLiabilities" contextRef="previous" unitRef="GBP" scale="0">4,133</ix:nonFraction>
    <ix:nonFraction name="core:CurrentAssets" contextRef="current" unitRef="GBP" scale="3">21.451</ix:nonFraction>
    <ix:nonFraction name="core:AverageNumberEmployeesDuringPeriod" contextRef="current" unitRef="Pure">2</ix:nonFraction>
    <ix:nonNumeric name="core:RevenueRecognitionPolicy" contextRef="current">Turnover is invoiced value.</ix:nonNumeric>
  </body>
</html>"""


class CompaniesHouseFactsTest(unittest.TestCase):
    def test_extracts_explicit_current_and_prior_facts(self):
        facts = _extract_ixbrl(SAMPLE_IXBRL, "2026-04-30")
        self.assertEqual(facts["net_assets"]["current"], 7903)
        self.assertEqual(facts["net_assets"]["previous"], 4133)
        self.assertEqual(facts["current_assets"]["current"], 21451)
        self.assertEqual(facts["employees"]["current"], 2)

    def test_does_not_infer_turnover_from_policy_text(self):
        facts = _extract_ixbrl(SAMPLE_IXBRL, "2026-04-30")
        self.assertNotIn("turnover", facts)

    def test_parses_sign_parentheses_and_scale(self):
        self.assertEqual(_fact_number("(1,250)", "0", None), -1250)
        self.assertEqual(_fact_number("1.5", "3", None), 1500)
        self.assertEqual(_fact_number("20", "0", "-"), -20)


if __name__ == "__main__":
    unittest.main()

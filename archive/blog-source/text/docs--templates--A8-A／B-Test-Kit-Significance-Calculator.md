# A8 A／B Test Kit Significance Calculator

**Source:** templates

---

## How To Use This Template

 |  |  |  |  |  |  |  |  |  | How to Use This Template: |  |  | 
 |  |  |  |  |  |  |  |  |  | In the Calculator tab, plug your result into the red cells. You'll see the conversion rates and standard level of error calculate automatically for you based on the numbers you inputted in Step 1. 

Based on these inputs, you'll see the estimated range of condidence that the value is statistically significant based on Z score confidence intervals. These are then used to test the P value against the confidence intervals. 

Feel free to look at the equations within the cells to see how the logic is calculated. Read cells C38:E41 to the right, then down. The results of your test (and whether or not they are significant) will be printed for you here. For the logic behind the formulas, feel free to click into the cells.  |  |  | 
 | A/B Test Kit |  |  |  |  |  |  |  |  |  |  |  | 
 | Significance  |  |  |  |  |  |  |  |  |  |  |  | 
 | Calculator  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Hubspot Marketing Hub |  |  |  |  |  |  |  |  |  |  | 
 |  | All your marketing tools and data — all under one roof. |  |  |  |  |  |  |  |  |  |  | 
 |  |  | Get Started |  |  |  |  |  |  |  |  |  | 

## Calculator

 | Step 1:  | Plug and Chug your Visits and Conversion rates from each variation here! |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  |  |  |  | Plug your result into the red cells on the left (D5:E6) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  |  | Visitors | Conversions |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Variation A | 5000.0 | 802.0 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Variatio B | 5001.0 | 801.0 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 | Step 2:  | Your variations' conversion rates and standard error.  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  |  |  |  | You'll see the conversion rates and standard level of error calculate automatically for you based on the numbers you inputted in Step 1. |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  |  | Conversion Rate | Standard Error |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Variation A | 0.1604 | 0.005189833138 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Variation B | 0.1601679664 | 0.005186275957 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 | Step 3:  | Significance levels based on your inputs |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | 90% Conversion Rate Limits |  |  | Based on your inputs in Step 1, you'll see the estimated range of condidence that the value is statistically significant based on Z score confidence intervals. These are then used to test the P value against the confidence intervals. Feel free to look at the equations within the cells to see how the logic is calculated.  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  |  | From | To |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Variation A | 0.1518367753 | 0.1689632247 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Variation B | 0.1516106111 | 0.1687253217 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | 95% Conversion Rate Limits |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  |  | From | To |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Variation A | 0.150227927 | 0.170572073 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Variation B | 0.1500028655 | 0.1703330673 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 | Step 4 | How confident are we that your test is significant based? |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Significant At |  |  | This step calulates the results. If P passes the 90% and the 95%, you result below will say the test is statistically significant. If P passes the 90% but not the 95%, the result will say it is unlikely to be statistically signficant. If the results say it does not pass either, the test is not statistically significant.  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Does it pass 90% confidence? |  | NO |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Does it pass 95 Confidence? |  | NO |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | Z =  | 0.03162505639 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | P-value =  | 0.5126144694 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 | Step 5 | Are you test signifiant? Find the answer here.  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  |  |  |  | Read cells C38:E41 to the right, then down. The results of your test (and whether or not they are significant) will be printed for you here. For the logic behind the formulas, feel free to click into the cells.  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 | Read cells to right, then down  | Version A | converted | 0.001448689139 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | better than  | Version B. | We are |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | 0.5126144694 | certain that the changes in  | Version A |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  | will improve your conversion rate. | Your test is not statistically significant. |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 

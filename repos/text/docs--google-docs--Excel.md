# Excel

**Source:** google-docs

---

To create an Excel calculator that evaluates the most favorable return for each type of rate based on your assumptions of the S&P 500's performance, you’ll need to break down the problem into different components, where each part of the annuity is calculated based on user inputs (e.g., the expected S&P 500 performance, the cap rate, the participation rate, etc.).

Here’s a step-by-step outline on how to structure your Excel calculator:

### 1. **Define Inputs:**

These are the values you’ll enter into the spreadsheet:

- **Expected S&P 500 Performance (%):** The user will input an estimate for the S&P 500's performance (either positive or negative).

- **Cap Rate (%):** The maximum rate that can be earned from the S&P 500 performance (e.g., 10.5%).

- **Guaranteed Cap Rate (%):** The fixed guaranteed cap rate (e.g., 8.6%).

- **Participation Rate (%):** The percentage of S&P 500 performance the client will participate in (e.g., 60%).

- **Performance Trigger Rate (%):** The rate when the S&P 500 is positive (e.g., 6.5%).

- **Inverse Performance Trigger Rate (%):** The rate when the S&P 500 is negative (e.g., 14.7%).

- **Fixed Rate (%):** The constant rate regardless of market performance (e.g., 4.3%).

- **Initial Contribution:** The amount initially invested in the annuity (this is for calculating the actual value).

- **Surrender Period (Years):** 5 or 7 years, which determines the length of the guarantee period.

- **Account Value Thresholds:** These thresholds (e.g., $0-99,999, $100,000-$499,999, $500,000 and up) could determine the applicable rate bands for the cap rate.

### 2. **Constructing the Calculations:**

For each possible scenario (up, down, sideways), you will calculate the return for each rate type:

#### A. **Cap Rate:**

- If the S&P 500 performance is less than the cap rate, return the actual performance.

- If the S&P 500 performance is greater than the cap rate, return the cap rate.

Formula:

```excel

=IF(Performance% <= CapRate%, Performance%, CapRate%)

```

#### B. **Guaranteed Cap Rate:**

The guaranteed cap rate will always apply if the S&P 500’s performance is below the guaranteed cap rate (if it’s within the surrender period). You can use this for a fixed return regardless of S&P performance.

Formula:

```excel

=IF(Performance% <= GuaranteedCapRate%, GuaranteedCapRate%, 1%)

```

#### C. **Participation Rate:**

- If the S&P 500 performance is positive, the return is the S&P 500’s performance multiplied by the participation rate.

- If the performance is negative, the return is 0 or the minimum guaranteed rate.

Formula:

```excel

=IF(Performance% > 0, Performance% * ParticipationRate%, 1%)

```

#### D. **Performance Trigger Rate:**

This applies when the S&P 500 has a positive return, and you will apply the trigger rate.

Formula:

```excel

=IF(Performance% > 0, PerformanceTriggerRate%, 1%)

```

#### E. **Inverse Performance Trigger Rate:**

This applies when the S&P 500 has a negative return, and you will apply the inverse trigger rate.

Formula:

```excel

=IF(Performance% < 0, InversePerformanceTriggerRate%, 1%)

```

#### F. **Fixed Rate:**

This is a simple fixed return, unaffected by the market performance.

Formula:

```excel

=FixedRate

```

### 3. **Calculation of Account Value Change:**

For each scenario (up/down/sideways), calculate the account value based on the selected strategy. Here, you’ll take the initial investment and apply the return from the selected strategy:

```excel

=InitialContribution * (1 + Return%)

```

### 4. **Comparison of Results:**

Once you have the potential returns for each method, you can calculate the overall return for each scenario (up, down, sideways). The idea is to compare the outcomes of different strategies depending on your forecasted S&P 500 performance.

### Example Layout:

| **Input**                    | **Value**        |

|------------------------------|------------------|

| Expected S&P 500 Performance (%) | (user input)   |

| Cap Rate (%)                  | (user input)     |

| Guaranteed Cap Rate (%)       | (user input)     |

| Participation Rate (%)        | (user input)     |

| Performance Trigger Rate (%)  | (user input)     |

| Inverse Performance Trigger Rate (%) | (user input) |

| Fixed Rate (%)                | (user input)     |

| Initial Contribution ($)      | (user input)     |

| Surrender Period (Years)      | 5 or 7           |

| **Calculation**               | **Formula**                    | **Output**  |

|-------------------------------|--------------------------------|------------|

| **Cap Rate Return**            | `=IF(ExpectedPerformance <= CapRate, ExpectedPerformance, CapRate)` | (Calculated) |

| **Guaranteed Cap Rate Return** | `=IF(ExpectedPerformance <= GuaranteedCapRate, GuaranteedCapRate, 1%)` | (Calculated) |

| **Participation Rate Return**  | `=IF(ExpectedPerformance > 0, ExpectedPerformance * ParticipationRate, 1%)` | (Calculated) |

| **Performance Trigger Return** | `=IF(ExpectedPerformance > 0, PerformanceTriggerRate, 1%)` | (Calculated) |

| **Inverse Performance Trigger Return** | `=IF(ExpectedPerformance < 0, InversePerformanceTriggerRate, 1%)` | (Calculated) |

| **Fixed Rate Return**          | `=FixedRate`                  | (Calculated) |

| **Account Value (Cap Rate)**   | `=InitialContribution * (1 + CapRateReturn)` | (Calculated) |

| **Account Value (Guaranteed Cap Rate)** | `=InitialContribution * (1 + GuaranteedCapRateReturn)` | (Calculated) |

| **Account Value (Participation)** | `=InitialContribution * (1 + ParticipationRateReturn)` | (Calculated) |

| **Account Value (Performance Trigger)** | `=InitialContribution * (1 + PerformanceTriggerReturn)` | (Calculated) |

| **Account Value (Inverse Performance Trigger)** | `=InitialContribution * (1 + InversePerformanceTriggerReturn)` | (Calculated) |

| **Account Value (Fixed Rate)** | `=InitialContribution * (1 + FixedRate)` | (Calculated) |

### 5. **Additional Features:**

- You can add a "Best Option" section, which compares the account values after applying each crediting method and returns the one with the highest value.

Formula:

```excel

=MAX(AccountValue_CapRate, AccountValue_GuaranteedCapRate, AccountValue_Participation, AccountValue_PerformanceTrigger, AccountValue_InversePerformanceTrigger, AccountValue_FixedRate)

```

This will give you the best option for the scenario based on your input assumptions.

### Final Remarks:

By following this structure, you’ll be able to input your expectations for the S&P 500's performance and automatically calculate which annuity rate structure (cap, participation, performance trigger, etc.) would provide the highest return. This will help you decide which hypothetical crediting method is best for the expected market conditions.

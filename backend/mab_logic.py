import numpy as np

class FairMultiArmedBandit:
    """
    Implements Thompson Sampling with a Fairness Penalty.
    """
    def __init__(self, n_arms):
        self.n_arms = n_arms
        # Alpha/Beta for Beta Distribution (Wins/Losses)
        # We start with 1,1 (Uniform prior)
        self.alpha = np.ones(n_arms) 
        self.beta = np.ones(n_arms)

    def update(self, arm_index, reward):
        """
        Update the probability distribution for an arm based on result.
        Reward should be binary (1=Win, 0=Loss).
        """
        if reward > 0:
            self.alpha[arm_index] += 1
        else:
            self.beta[arm_index] += 1

    def calculate_allocation(self, fairness_score: int):
        """
        Returns the % allocation for each arm.
        fairness_score (0-100): 
            0 = Pure Thompson Sampling (Greedy)
            100 = Uniform Distribution (Socialist/Fair)
        """
        # 1. Sample from Beta Distribution (Thompson Sampling)
        # This asks: "Based on history, how likely is each arm to win?"
        samples = [np.random.beta(self.alpha[i], self.beta[i]) for i in range(self.n_arms)]
        
        # 2. Normalize to get "Greedy Weights"
        total_sample = sum(samples)
        if total_sample == 0:
            greedy_weights = [1.0 / self.n_arms] * self.n_arms
        else:
            greedy_weights = [s / total_sample for s in samples]
        
        # 3. Calculate "Fair Weights" (Equal split)
        fair_weights = [1.0 / self.n_arms for _ in range(self.n_arms)]
        
        # 4. Blend them based on the Slider (Fairness Score)
        # lambda represents how much we care about fairness (0.0 to 1.0)
        lam = fairness_score / 100.0
        
        final_weights = []
        for i in range(self.n_arms):
            # The Core Formula: (1 - lambda) * Greedy + lambda * Fair
            weight = ((1 - lam) * greedy_weights[i]) + (lam * fair_weights[i])
            final_weights.append(weight)
            
        return final_weights
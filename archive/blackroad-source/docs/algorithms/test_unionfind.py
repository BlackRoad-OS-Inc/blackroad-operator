from algorithms.unionfind.count_islands import Solution

import unittest


class TestNumIslands2(unittest.TestCase):
    def test_num_islands2(self):
        solution = Solution()
        self.assertEqual([1, 1, 2, 3],
                         solution.num_islands2(3, 3,
                                               [[0, 0], [0, 1],
                                                [1, 2], [2, 1]]))
        self.assertEqual([1],
                         solution.num_islands2(1, 1, [[0, 0]]))
        self.assertEqual([1, 2, 3],
                         solution.num_islands2(3, 3,
                                               [[0, 0], [1, 1], [2, 2]]))


if __name__ == "__main__":
    unittest.main()

from algorithms.sort import (
    bitonic_sort,
    bogo_sort,
    bubble_sort,
    comb_sort,
    counting_sort,
    cycle_sort,
    max_heap_sort, min_heap_sort,
    insertion_sort,
    merge_sort,
    pancake_sort,
    quick_sort,
    selection_sort,
    bucket_sort,
    shell_sort,
    radix_sort,
    gnome_sort,
    cocktail_shaker_sort,
    top_sort, top_sort_recursive,
    sort_colors,
    wiggle_sort,
    can_attend_meetings,
)

import unittest


class TestSuite(unittest.TestCase):
    def test_bogo_sort(self):
        self.assertEqual([1, 5, 23],
                         bogo_sort([1, 23, 5]))

    def test_bitonic_sort(self):
        self.assertEqual([1, 2, 3, 5, 23, 57, 65, 1232],
                         bitonic_sort([1, 3, 2, 5, 65, 23, 57, 1232]))
        self.assertEqual([1, 2, 3, 5, 23, 57, 65, 1232],
                         bitonic_sort([1, 3, 2, 5, 65, 23, 57, 1232],False))
        self.assertEqual([1232, 65, 57, 23, 5, 3, 2, 1],
                         bitonic_sort([1, 2, 3, 5, 65, 23, 57, 1232],True))

    def test_bubble_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                         bubble_sort([1, 5, 65, 23, 57, 1232]))

    def test_comb_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                         comb_sort([1, 5, 65, 23, 57, 1232]))

    def test_counting_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                         counting_sort([1, 5, 65, 23, 57, 1232]))
        self.assertEqual([-1232, -65, -57, -23, -5, -1],
                         counting_sort([-1, -5, -65, -23, -57, -1232]))

    def test_cycle_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                         cycle_sort([1, 5, 65, 23, 57, 1232]))

    def test_heap_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                         max_heap_sort([1, 5, 65, 23, 57, 1232]))
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                         min_heap_sort([1, 5, 65, 23, 57, 1232]))

    def test_insertion_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                         insertion_sort([1, 5, 65, 23, 57, 1232]))

    def test_merge_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                         merge_sort([1, 5, 65, 23, 57, 1232]))

    def test_pancake_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                         pancake_sort([1, 5, 65, 23, 57, 1232]))

    def test_quick_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                         quick_sort([1, 5, 65, 23, 57, 1232]))

    def test_selection_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                         selection_sort([1, 5, 65, 23, 57, 1232]))

    def test_bucket_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                        bucket_sort([1, 5, 65, 23, 57, 1232]))

    def test_shell_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                        shell_sort([1, 5, 65, 23, 57, 1232]))

    def test_radix_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                        radix_sort([1, 5, 65, 23, 57, 1232]))

    def test_gnome_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                         gnome_sort([1, 5, 65, 23, 57, 1232]))

    def test_cocktail_shaker_sort(self):
        self.assertEqual([1, 5, 23, 57, 65, 1232],
                        cocktail_shaker_sort([1, 5, 65, 23, 57, 1232]))

class TestTopSort(unittest.TestCase):
    def setUp(self):
        self.depGraph = {
                            "a" : [ "b" ],
                            "b" : [ "c" ],
                            "c" :  [ 'e'],
                            'e' : [ 'g' ],
                            "d" : [ ],
                            "f" : ["e" , "d"],
                            "g" : [ ]
                        }

    def test_topsort(self):
        res = top_sort_recursive(self.depGraph)
        #print(res)
        self.assertTrue(res.index('g') < res.index('e'))
        res = top_sort(self.depGraph)
        self.assertTrue(res.index('g') < res.index('e'))


class TestSortColors(unittest.TestCase):
    def test_sort_colors(self):
        nums = [2, 0, 2, 1, 1, 0]
        sort_colors(nums)
        self.assertEqual([0, 0, 1, 1, 2, 2], nums)

        nums = [0]
        sort_colors(nums)
        self.assertEqual([0], nums)

        nums = [1]
        sort_colors(nums)
        self.assertEqual([1], nums)


class TestWiggleSort(unittest.TestCase):
    def test_wiggle_sort(self):
        nums = [3, 5, 2, 1, 6, 4]
        wiggle_sort(nums)
        for i in range(1, len(nums)):
            if i % 2 == 1:
                self.assertLess(nums[i - 1], nums[i])
            else:
                self.assertGreater(nums[i - 1], nums[i])


class TestMeetingRooms(unittest.TestCase):
    class Interval:
        def __init__(self, start, end):
            self.start = start
            self.end = end

    def test_can_attend_meetings(self):
        intervals = [self.Interval(0, 30), self.Interval(5, 10),
                     self.Interval(15, 20)]
        self.assertFalse(can_attend_meetings(intervals))

        intervals = [self.Interval(0, 5), self.Interval(10, 15),
                     self.Interval(15, 20)]
        self.assertTrue(can_attend_meetings(intervals))


if __name__ == "__main__":
    unittest.main()

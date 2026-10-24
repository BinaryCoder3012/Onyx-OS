/** A sample exchange showing how answers lean on the workspace. Illustrative, not a recorded session. */
export function AskFragment() {
  return (
    <div data-ui className="overflow-hidden rounded-2xl border border-seam bg-slab shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex h-11 items-center justify-between border-b border-seam px-4 text-[13px]">
        <span className="text-chalk">Ask Onyx</span>
        <span className="text-chalk-3">reads your workspace</span>
      </div>
      <div className="space-y-5 p-5 text-[15px] leading-relaxed">
        <div className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-shelf px-4 py-3 text-chalk">
          Why am I stuck around 1400 on Codeforces?
        </div>
        <div className="answer max-w-[92%] text-chalk-2">
          <p>
            Your last eight rounds tell the story: you clear A and B in about 25 minutes, then lose the rest of the round
            on C. Of the 23 problems you logged at 1400–1600, <strong>graphs and greedy</strong> make up 11, and 7 of those are
            still marked revisit.
          </p>
          <ul>
            <li>Close the 7 revisits first; they are the exact gap.</li>
            <li>Then 15 greedy problems at 1500, timed to 30 minutes each.</li>
            <li>Virtual-contest one Div 2 a week; stop reading C after 40 minutes and upsolve.</li>
          </ul>
          <p>Want me to add the greedy set to your roadmap as its own step?</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-seam-strong bg-onyx px-4 py-3 text-chalk-3">
          <kbd className="rounded border border-seam-strong px-1.5 text-[12px]">/</kbd>
          Ask about your ratings, plan or applications
        </div>
      </div>
    </div>
  );
}

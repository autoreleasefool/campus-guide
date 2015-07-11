package ca.josephroque.uottawacampusnavigator.adapter;

import android.content.Context;
import android.content.res.Resources;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.util.Pair;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import ca.josephroque.uottawacampusnavigator.NavigationApplication;
import ca.josephroque.uottawacampusnavigator.R;
import ca.josephroque.uottawacampusnavigator.util.DataFormatter;

/**
 * Created by Joseph Roque on 15-05-26.
 * <p/>
 * Manages the data displayed in a LinkFragment.
 */
public class LinksAdapter
        extends RecyclerView.Adapter<LinksAdapter.LinksViewHolder>
        implements View.OnClickListener
{

    /** Identifies output from this class in Logcat. */
    @SuppressWarnings("unused")
    private static final String TAG = "LinksAdapter";

    /** Represents an item which references more links. */
    private static final byte TYPE_MORE_LINKS = 0;
    /** Represents an item which is a phone number. */
    private static final byte TYPE_PHONE_NUMBER = 1;
    /** Represents an item which is a hyperlink. */
    private static final byte TYPE_HYPERLINK = 2;
    /** Represents an item which returns to previous list. */
    private static final byte TYPE_RETURN = 3;

    /** Instance of callback interface. */
    private LinkAdapterCallback mCallback;

    /** Array of names and values which will be displayed in the recycler view. */
    private String[] mLinkValues;

    /** Indicates if this adapter was created from a previous LinkAdapter callback . */
    private boolean mHasParentList;
    /** Name of the parent list. */
    private String mParentList;
    /** Name of the current list. */
    private String mListName;

    /**
     * Gets an array for {@code mLinkValues} from resources based on linksArray.
     *
     * @param callback instance of callback interface
     * @param context for resources
     * @param linksArray which useful_links array will be used
     * @param hasParentList indicates if this fragment has a parent
     * @param parentList name of parent list or null if there isn't one
     * @param listName name of current list
     */
    public LinksAdapter(LinkAdapterCallback callback, Context context,
                        int linksArray, boolean hasParentList, String parentList, String listName)
    {
        final Resources resources = context.getResources();
        final int linkId = resources.getIdentifier("useful_links_" + linksArray,
                "array", NavigationApplication.getSimplePackageName());

        mLinkValues = resources.getStringArray(linkId);
        mHasParentList = hasParentList;
        mParentList = parentList;
        mListName = listName;
        mCallback = callback;
    }

    @Override
    public LinksViewHolder onCreateViewHolder(ViewGroup parent, int viewType)
    {
        View itemLayout = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_textview, parent, false);
        return new LinksViewHolder(itemLayout);
    }

    @Override
    public void onBindViewHolder(final LinksViewHolder viewHolder, final int position)
    {
        viewHolder.itemView.setOnClickListener(this);
        RelativeLayout.LayoutParams layoutParams =
                (RelativeLayout.LayoutParams) viewHolder.mImageViewIcon.getLayoutParams();
        layoutParams.addRule(RelativeLayout.CENTER_VERTICAL);

        // Adds header item to return to previous list, if there is a parent
        final byte positionOffset;
        if (mHasParentList)
        {
            if (position == 0)
            {
                viewHolder.itemView.setTag(Pair.create(TYPE_RETURN, 0));
                viewHolder.itemView.setBackgroundColor(viewHolder.itemView.getContext()
                        .getResources()
                        .getColor(R.color.primary_garnet));

                viewHolder.mImageViewIcon.setImageResource(R.drawable.ic_arrow_back);
                viewHolder.mTextViewTitle.setText(mListName);
                viewHolder.mTextViewSubtitle.setText(viewHolder.mTextViewSubtitle.getContext()
                        .getResources()
                        .getString(R.string.text_return_to) + " " + mParentList);
                return;
            }
            positionOffset = 1;
        }
        else
            positionOffset = 0;

        String[] itemSplit = mLinkValues[position - positionOffset].split("~");
        viewHolder.mTextViewTitle.setText(itemSplit[0]);
        viewHolder.itemView.setBackgroundColor(viewHolder.itemView.getContext()
                .getResources()
                .getColor(R.color.primary_gray));

        if (itemSplit[1].matches("\\d+"))
        {
            // Item links to a new list of links
            viewHolder.mImageViewIcon.setImageResource(R.drawable.ic_folder);
            viewHolder.mTextViewSubtitle.setText(R.string.text_view_links);
            viewHolder.itemView.setTag(Pair.create(TYPE_MORE_LINKS,
                    Pair.create(Integer.parseInt(itemSplit[1]), itemSplit[0])));
        }
        else if (itemSplit[1].charAt(0) == '#')
        {
            // Item is a phone number
            String phoneNumber = DataFormatter.formatPhoneNumber(itemSplit[1].substring(1));
            viewHolder.mImageViewIcon.setImageResource(R.drawable.ic_call);
            viewHolder.mTextViewSubtitle.setText(phoneNumber);
            viewHolder.itemView.setTag(Pair.create(TYPE_PHONE_NUMBER, phoneNumber));
        }
        else
        {
            // Item is a hyperlink
            viewHolder.mImageViewIcon.setImageResource(R.drawable.ic_link);
            viewHolder.mTextViewSubtitle.setText(itemSplit[1]);
            viewHolder.itemView.setTag(Pair.create(TYPE_HYPERLINK, itemSplit[1]));
        }
    }

    @Override
    public void onDetachedFromRecyclerView(RecyclerView recyclerView)
    {
        super.onDetachedFromRecyclerView(recyclerView);
        mCallback = null;
    }

    @Override
    public int getItemCount()
    {
        return mLinkValues.length + ((mHasParentList)
                ? 1
                : 0);
    }

    @Override
    public void onClick(View view)
    {
        try
        {
            Pair<?, ?> pair = (Pair) view.getTag();

            switch ((Byte) pair.first)
            {
                case TYPE_MORE_LINKS:
                    if (mCallback != null)
                    {
                        // Invokes callback method to open next fragment
                        Pair<?, ?> secondPair = (Pair) pair.second;
                        int linksArray = ((Integer) secondPair.first);
                        String listName = secondPair.second.toString();
                        mCallback.openSublinks(linksArray, listName);
                    }
                    break;
                case TYPE_PHONE_NUMBER:
                    // Invokes callback method to open phone keypad
                    if (mCallback != null)
                        mCallback.promptCallPhoneNumber(pair.second.toString());
                    break;
                case TYPE_HYPERLINK:
                    // Invokes callback method to open link in browser
                    if (mCallback != null)
                        mCallback.openHyperlink(pair.second.toString());
                    break;
                case TYPE_RETURN:
                    // Invokes callback method to return to parent list
                    if (mCallback != null)
                        mCallback.moveUpList();
                    break;
                default:
                    throw new IllegalStateException("Type invalid");
            }
        }
        catch (ClassCastException ex)
        {
            throw new ClassCastException("Tag must be a pair with a type and value");
        }
    }

    /**
     * Callback interface to pass user interactions to fragment.
     */
    public interface LinkAdapterCallback
    {
        /**
         * Creates a new instance of LinksFragment with a new set of links.
         *
         * @param linksArray which useful_links array will be displayed
         * @param listTitle title of useful links array
         */
        void openSublinks(int linksArray, String listTitle);

        /**
         * Prompts user to open a hyperlink in a browser window.
         *
         * @param link hyperlink to open
         */
        void openHyperlink(String link);

        /**
         * Prompts user to call the specified phone number.
         *
         * @param phoneNumber number to call
         */
        void promptCallPhoneNumber(String phoneNumber);

        /**
         * Returns to previous useful_links list.
         */
        void moveUpList();
    }

    /**
     * Subclass of RecyclerView.ViewHolder to manage view which will display text to the user.
     */
    public static class LinksViewHolder
            extends RecyclerView.ViewHolder
    {
        /** Displays title of the item. */
        private TextView mTextViewTitle;
        /** Displays subtitle of the item. */
        private TextView mTextViewSubtitle;
        /** Displays icon of the item. */
        private ImageView mImageViewIcon;

        /**
         * Gets references for member variables from {@code itemLayout} then passes {@code
         * itemLayout} to super constructor.
         *
         * @param itemLayout root layout of view holder
         */
        public LinksViewHolder(View itemLayout)
        {
            super(itemLayout);
            mTextViewTitle = (TextView) itemLayout.findViewById(R.id.tv_item_title);
            mTextViewSubtitle = (TextView) itemLayout.findViewById(R.id.tv_item_subtitle);
            mImageViewIcon = (ImageView) itemLayout.findViewById(R.id.iv_item_icon);
        }
    }
}

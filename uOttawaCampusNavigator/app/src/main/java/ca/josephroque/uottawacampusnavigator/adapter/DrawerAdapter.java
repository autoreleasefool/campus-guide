package ca.josephroque.uottawacampusnavigator.adapter;

import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import ca.josephroque.uottawacampusnavigator.R;

/**
 * Created by Joseph Roque on 15-05-25.
 * <p/>
 * Manages data which will be displayed by the Navigation Drawer
 */
public class DrawerAdapter extends RecyclerView.Adapter<DrawerAdapter.DrawerViewHolder>
{

    /** Indicates the type of the item is header. */
    private static final int TYPE_HEADER = 0;
    /** Indicates the type of the item is a regular item. */
    private static final int TYPE_ITEM = 1;

    /** Instance of callback interface for user events. */
    private DrawerAdapterCallbacks mCallback;

    /** Array of image ids to display as icons for drawer items. */
    private int[] mArrayItemIcons;
    /** Array of strings to display as names for drawer items. */
    private String[] mArrayItemNames;

    /**
     * Assigns references to parameters
     *
     * @param callback instance of callback interface
     * @param itemIcons array of image ids
     * @param itemNames array of strings
     */
    public DrawerAdapter(DrawerAdapterCallbacks callback, int[] itemIcons, String[] itemNames)
    {
        this.mCallback = callback;
        this.mArrayItemIcons = itemIcons;
        this.mArrayItemNames = itemNames;
    }

    @Override
    public DrawerViewHolder onCreateViewHolder(ViewGroup parent, int viewType)
    {
        View itemLayout;
        if (viewType == TYPE_HEADER)
        {
            itemLayout = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.header_navigation_drawer, parent, false);
        }
        else
        {
            itemLayout = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.list_navigation_drawer, parent, false);
        }
        return new DrawerViewHolder(itemLayout, viewType);
    }

    @Override
    public void onBindViewHolder(DrawerViewHolder viewHolder, final int position)
    {
        switch (viewHolder.mViewType)
        {
            case TYPE_HEADER:
                //do nothing
                break;
            case TYPE_ITEM:
                viewHolder.mTextViewItemName.setText(mArrayItemNames[position - 1]);
                viewHolder.mImageViewItemIcon.setImageResource(mArrayItemIcons[position - 1]);
                viewHolder.itemView.setOnClickListener(new View.OnClickListener()
                {
                    @Override
                    public void onClick(View v)
                    {
                        mCallback.onDrawerItemClicked(position - 1);
                    }
                });
                break;
            default:
                throw new IllegalStateException("Illegal value for view type: "
                        + viewHolder.mViewType);
        }
    }

    @Override
    public int getItemViewType(int position)
    {
        return (position == 0)
                ? TYPE_HEADER
                : TYPE_ITEM;
    }

    @Override
    public int getItemCount()
    {
        return mArrayItemNames.length + 1;
    }

    /**
     * Offers methods for sending events to the navigation drawer which uses this adapter.
     */
    public interface DrawerAdapterCallbacks
    {
        /**
         * Called when an item in the drawer is clicked, so the parent fragment can handle
         * the user interaction.
         * @param position view which was clicked.
         */
        void onDrawerItemClicked(int position);
    }

    /**
     * Subclass of RecyclerView.ViewHolder to manage view which will display an image
     * and text to the user.
     */
    public static class DrawerViewHolder extends RecyclerView.ViewHolder
    {
        /** ImageView for icon of list item. */
        private ImageView mImageViewItemIcon;
        /** TextView for name of list item. */
        private TextView mTextViewItemName;
        /** Type of the view holder */
        private int mViewType;

        /**
         * Calls super constructor with {@code itemLayout} as parameter and gets references
         * for member variables from {@code itemLayou}.
         *
         * @param itemLayout root layout
         * @param viewType type of view holder
         */
        public DrawerViewHolder(View itemLayout, int viewType)
        {
            super(itemLayout);

            mViewType = viewType;
            if (viewType != TYPE_HEADER)
            {
                mImageViewItemIcon = (ImageView) itemLayout.findViewById(R.id.iv_navigation_item_icon);
                mTextViewItemName = (TextView) itemLayout.findViewById(R.id.tv_navigation_item_name);
            }
        }
    }
}
